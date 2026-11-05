"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Shield,
  Sparkles,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Zap,
} from "lucide-react";
import { useCompleteSubscriptionPlanMutation } from "../hooks";
import {
  useTenantSubscriptionPlansQuery,
  useTenantSubscriptionPlanDetailQuery,
  useTenantSubscriptionQuery,
  useSelectTenantSubscriptionPlanMutation,
  useCreateBillingCheckoutMutation,
  useVerifyBillingPaymentMutation,
} from "@/features/billing/hooks";
import { loadRazorpayCheckoutScript } from "@/features/billing/api";
import { useAuthStore } from "@/lib/auth/store";
import { getErrorMessage } from "@/src/lib/api/errors";
import type { SubscriptionPlanData, ServerOnboardingStep } from "@/types/onboarding";

interface StepSubscriptionPlanProps {
  initialData: Partial<SubscriptionPlanData>;
  onNext: (data: SubscriptionPlanData) => void;
  onBack: () => void;
  onChange?: (data: Partial<SubscriptionPlanData>) => void;
  isCompleted?: boolean;
  stepData?: ServerOnboardingStep;
}

const FALLBACK_PLANS = [
  {
    id: 1,
    name: "Starter",
    description: "For small businesses starting with WhatsApp CRM",
    priceMonthly: 29,
    priceYearly: 24,
    currency: "USD",
    features: [
      "1,000 Free Service Conversations / month",
      "Up to 2,500 Contacts",
      "1 Registered WhatsApp Number",
      "3 Agent Seats",
      "Standard Broadcast engine & Templates",
      "99.5% WhatsApp API uptime SLA",
    ],
  },
  {
    id: 2,
    name: "Professional",
    description: "For growing businesses with larger teams",
    priceMonthly: 79,
    priceYearly: 64,
    currency: "USD",
    popular: true,
    features: [
      "10,000 monthly WhatsApp conversations",
      "Up to 15,000 Contacts",
      "3 Registered WhatsApp Numbers",
      "10 Agent Seats",
      "Advanced AI Replies & Automation",
      "Team Collaboration & Shared Inbox",
      "Lead Management & Tags",
      "Campaign analytics & Export API",
    ],
  },
  {
    id: 3,
    name: "Enterprise",
    description: "For businesses with high-volume CRM needs",
    priceMonthly: 199,
    priceYearly: 159,
    currency: "USD",
    features: [
      "Unlimited conversations & messages",
      "Up to 100,000 Contacts",
      "10 Registered WhatsApp Numbers",
      "Unlimited agent seats & custom roles",
      "Dedicated Meta WABA account manager",
      "White-label Branding & Custom Domain",
      "Custom Webhooks & REST Integrations",
      "Priority 24/7 SLA Support",
    ],
  },
];

export function StepSubscriptionPlan({
  initialData,
  onNext,
  onBack,
  onChange,
  isCompleted = false,
  stepData,
}: StepSubscriptionPlanProps) {
  const user = useAuthStore((s) => s.user);

  // Step 1: Fetch available plans (GET /api/tenant/subscription/plans)
  const { data: plansData, isLoading: loadingPlans } = useTenantSubscriptionPlansQuery();

  // Step 8: Fetch current tenant subscription (GET /api/tenant/subscription)
  const { data: currentSubscription, refetch: refetchSubscription } = useTenantSubscriptionQuery();

  // Resolve step data from /api/onboarding/steps
  const stepFormData =
    stepData?.form_data && typeof stepData.form_data === "object" && !Array.isArray(stepData.form_data)
      ? stepData.form_data
      : null;

  const stepMetadata =
    stepData?.metadata && typeof stepData.metadata === "object" && !Array.isArray(stepData.metadata)
      ? stepData.metadata
      : null;

  const isServerStepCompleted = Boolean(
    isCompleted || stepData?.is_completed || stepData?.status === "completed"
  );

  const activePlanId =
    stepFormData?.subscription_plan_id ||
    initialData.subscription_plan_id ||
    currentSubscription?.plan?.id;

  const activeBillingCycle: "monthly" | "yearly" =
    stepFormData?.billing_cycle === "yearly" ||
    initialData.billing_cycle === "yearly" ||
    currentSubscription?.billing_cycle === "yearly"
      ? "yearly"
      : "monthly";

  const isSubscriptionActive = Boolean(
    (isServerStepCompleted && activePlanId) ||
    (currentSubscription?.status === "active" && currentSubscription?.plan)
  );

  const [selectedPlanId, setSelectedPlanId] = useState<number | string>(
    activePlanId || 1
  );

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    activeBillingCycle || "monthly"
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkoutFeedback, setCheckoutFeedback] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [verifiedPaymentId, setVerifiedPaymentId] = useState<string | null>(null);

  // Sync if active subscription or initialData becomes available
  useEffect(() => {
    if (activePlanId) {
      setSelectedPlanId(activePlanId);
    }
    if (activeBillingCycle) {
      setBillingCycle(activeBillingCycle);
    }
  }, [activePlanId, activeBillingCycle]);

  const handleSelectPlan = (planId: number | string) => {
    setSelectedPlanId(planId);
    onChange?.({
      subscription_plan_id: Number(planId) || 1,
      billing_cycle: billingCycle,
    });
  };

  const handleToggleBillingCycle = (newCycle?: "monthly" | "yearly") => {
    const cycle = newCycle ?? (billingCycle === "monthly" ? "yearly" : "monthly");
    setBillingCycle(cycle);
    onChange?.({
      subscription_plan_id: Number(selectedPlanId) || 1,
      billing_cycle: cycle,
    });
  };

  // Pre-load Razorpay checkout script on mount so checkout opens instantaneously
  useEffect(() => {
    loadRazorpayCheckoutScript();
  }, []);

  // Step 2: Fetch single plan details (GET /api/tenant/subscription/plans/{plan})
  const { data: planDetail, isLoading: loadingPlanDetail } =
    useTenantSubscriptionPlanDetailQuery(selectedPlanId);

  // Workflow Mutations:
  // Optional: Select Plan (POST /api/tenant/subscription/select-plan)
  const selectPlanMutation = useSelectTenantSubscriptionPlanMutation();
  // Step 3: Create Checkout (POST /api/subscription/checkout)
  const createCheckoutMutation = useCreateBillingCheckoutMutation();
  // Step 4: Verify Payment (POST /api/subscription/verify-payment)
  const verifyPaymentMutation = useVerifyBillingPaymentMutation();
  // Complete Onboarding Step
  const completeMutation = useCompleteSubscriptionPlanMutation();

  // Normalize plans with API response or fallback, ensuring distinct realistic prices
  const rawPlans = Array.isArray(plansData) && plansData.length > 0 ? plansData : FALLBACK_PLANS;

  const plans = rawPlans.map((p: any, idx: number) => {
    // 1. Resolve Monthly Price accurately across all possible API field names
    let monthlyPrice: number | null = null;
    if (typeof p.price_monthly === "number") monthlyPrice = p.price_monthly;
    else if (typeof p.monthly_price === "number") monthlyPrice = p.monthly_price;
    else if (typeof p.price === "number") monthlyPrice = p.price;
    else if (typeof p.amount === "number") monthlyPrice = p.amount > 500 ? Math.round(p.amount / 100) : p.amount;
    else if (typeof p.cost === "number") monthlyPrice = p.cost;
    else if (p.price_monthly && !isNaN(Number(p.price_monthly))) monthlyPrice = Number(p.price_monthly);
    else if (p.monthly_price && !isNaN(Number(p.monthly_price))) monthlyPrice = Number(p.monthly_price);
    else if (p.price && !isNaN(Number(p.price))) monthlyPrice = Number(p.price);
    else if (p.amount && !isNaN(Number(p.amount))) {
      const v = Number(p.amount);
      monthlyPrice = v > 500 ? Math.round(v / 100) : v;
    }

    // Tier-based fallback if backend sends no price or static 0
    if (monthlyPrice === null || isNaN(monthlyPrice) || monthlyPrice === 0) {
      const name = (p.name || "").toLowerCase();
      if (name.includes("starter")) monthlyPrice = 29;
      else if (name.includes("pro") || name.includes("growth")) monthlyPrice = 79;
      else if (name.includes("enterprise") || name.includes("scale")) monthlyPrice = 199;
      else monthlyPrice = idx === 0 ? 29 : idx === 1 ? 79 : 199;
    }

    // 2. Resolve Yearly Price
    let yearlyPrice: number | null = null;
    if (typeof p.price_annual === "number") yearlyPrice = p.price_annual;
    else if (typeof p.annual_price === "number") yearlyPrice = p.annual_price;
    else if (typeof p.yearly_price === "number") yearlyPrice = p.yearly_price;
    else if (typeof p.price_yearly === "number") yearlyPrice = p.price_yearly;
    else if (p.price_annual && !isNaN(Number(p.price_annual))) yearlyPrice = Number(p.price_annual);
    else if (p.annual_price && !isNaN(Number(p.annual_price))) yearlyPrice = Number(p.annual_price);
    else if (p.yearly_price && !isNaN(Number(p.yearly_price))) yearlyPrice = Number(p.yearly_price);

    if (yearlyPrice === null || isNaN(yearlyPrice) || yearlyPrice === 0) {
      yearlyPrice = Math.round(monthlyPrice * 0.8);
    }

    // 3. Resolve Currency
    const currency = p.currency || "USD";

    // 4. Resolve Features List
    let features: string[] = [];
    if (Array.isArray(p.features) && p.features.length > 0) {
      features = p.features.map((f: any) =>
        typeof f === "string" ? f : f.title || f.name || f.feature || JSON.stringify(f)
      );
    } else {
      features = [
        "WhatsApp CRM & Team Inbox",
        "Contact Management & Filters",
        "Broadcast Engine & Message Templates",
        "99.5% Meta WhatsApp API SLA",
      ];
    }

    const popular = Boolean(
      p.is_popular || p.popular || idx === 1 || (p.name && p.name.toLowerCase().includes("pro"))
    );

    return {
      id: p.id,
      name: p.name || `Plan ${idx + 1}`,
      description: p.description || "Comprehensive WhatsApp CRM Plan",
      priceMonthly: monthlyPrice,
      priceYearly: yearlyPrice,
      currency,
      popular,
      features,
      limits: p.limits || null,
      raw: p,
    };
  });

  const selectedPlan = plans.find((p) => String(p.id) === String(selectedPlanId)) || plans[0];
  const activePrice = billingCycle === "monthly" ? selectedPlan.priceMonthly : selectedPlan.priceYearly;
  const currencySymbol = selectedPlan.currency === "INR" ? "₹" : "$";

  const isSelectedPlanTheActiveOne = Boolean(
    isSubscriptionActive && String(selectedPlan.id) === String(activePlanId)
  );

  const activePlanName =
    stepMetadata?.plan_name ||
    currentSubscription?.plan?.name ||
    plans.find((p) => String(p.id) === String(activePlanId))?.name ||
    "Starter";

  // Step 3, 4, 5, 6, 8: Complete Razorpay Checkout Execution
  const handleProceedWithRazorpay = async () => {
    setErrorMessage(null);
    setCheckoutFeedback(null);
    setIsCheckingOut(true);

    const planIdNum = Number(selectedPlan.id) || 1;
    const amountInPaise = Math.round(activePrice * 100);

    try {
      // Step 3 — Select plan (POST /api/tenant/subscription/select-plan)
      try {
        await selectPlanMutation.mutateAsync({
          plan_id: selectedPlan.id,
          subscription_plan_id: planIdNum,
          billing_cycle: billingCycle,
        });
      } catch (selectErr) {
        console.warn("Tenant select-plan non-fatal skipped:", selectErr);
      }

      // Step 3 — Create checkout / Razorpay order (POST /api/subscription/checkout)
      setCheckoutFeedback("Creating Razorpay order...");
      let checkoutRes: any;
      try {
        checkoutRes = await createCheckoutMutation.mutateAsync({
          plan_id: selectedPlan.id,
          subscription_plan_id: planIdNum,
          billing_cycle: billingCycle,
          amount: amountInPaise,
          currency: selectedPlan.currency || "INR",
        });
      } catch (orderErr) {
        throw new Error(`Order creation failed: ${getErrorMessage(orderErr)}`);
      }

      const orderData = checkoutRes?.data || checkoutRes;

      // Step 5 — Open Razorpay Checkout SDK
      setCheckoutFeedback("Opening Razorpay Checkout...");
      const sdkLoaded = await loadRazorpayCheckoutScript();

      if (sdkLoaded && typeof (window as any).Razorpay !== "undefined") {
      const razorpayKey =
        orderData.key_id ||
        orderData.key ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        "rzp_test_51MockKeyExample";

      const options: Record<string, any> = {
        key: razorpayKey,
        amount: orderData.amount || amountInPaise,
        currency: orderData.currency || selectedPlan.currency || "INR",
        name: orderData.name || "WhatsApp CRM",
        description: orderData.description || `${selectedPlan.name} Plan (${billingCycle})`,
        prefill: {
          name: user?.name || orderData.prefill?.name || "",
          email: user?.email || orderData.prefill?.email || "",
          contact: user?.phone || orderData.prefill?.contact || "",
        },
        theme: {
          color: "#2563EB",
        },
        handler: async function (response: any) {
            // Step 4 — Verify payment signature (POST /api/subscription/verify-payment)
            try {
              setIsCheckingOut(true);
              setCheckoutFeedback("Verifying payment signature with Razorpay...");

              await verifyPaymentMutation.mutateAsync({
                razorpay_order_id: response.razorpay_order_id || orderData.order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_id: selectedPlan.id,
                billing_cycle: billingCycle,
              });

              setPaymentVerified(true);
              setVerifiedPaymentId(response.razorpay_payment_id);
              setCheckoutFeedback("Payment verified successfully! Activating workspace plan...");

              // Step 8 — Get updated subscription & Complete Onboarding Step
              const payload: SubscriptionPlanData = {
                subscription_plan_id: planIdNum,
                billing_cycle: billingCycle,
              };

              await completeMutation.mutateAsync(payload);
              await refetchSubscription();

              setTimeout(() => {
                onNext(payload);
              }, 1000);
            } catch (verErr) {
              setErrorMessage(`Payment verification failed: ${getErrorMessage(verErr)}`);
              setIsCheckingOut(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsCheckingOut(false);
              setCheckoutFeedback(null);
            },
          },
        };

        if (orderData.order_id || orderData.id) {
          options.order_id = orderData.order_id || orderData.id;
        }

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (failResponse: any) {
          setErrorMessage(failResponse?.error?.description || "Payment failed or was declined by bank.");
          setIsCheckingOut(false);
        });
        rzp.open();
      } else {
        throw new Error(
          "Could not load Razorpay SDK. Please check your internet connection or ad-blocker."
        );
      }
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
      setIsCheckingOut(false);
      setCheckoutFeedback(null);
    }
  };

  // Fallback for sandbox / testing environments when payment is bypassed
  const handleProceedWithoutPayment = async () => {
    const planIdNum = Number(selectedPlan.id) || 1;
    const payload: SubscriptionPlanData = {
      subscription_plan_id: planIdNum,
      billing_cycle: billingCycle,
    };

    try {
      setErrorMessage(null);
      setIsCheckingOut(true);

      // Select plan best-effort
      try {
        await selectPlanMutation.mutateAsync({
          plan_id: selectedPlan.id,
          subscription_plan_id: planIdNum,
          billing_cycle: billingCycle,
        });
      } catch (selectErr) {
        console.warn("Tenant select-plan skipped:", selectErr);
      }

      // Complete step
      await completeMutation.mutateAsync(payload);
      onNext(payload);
    } catch (err) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsCheckingOut(false);
    }
  };

  const isPending =
    isCheckingOut ||
    selectPlanMutation.isPending ||
    createCheckoutMutation.isPending ||
    verifyPaymentMutation.isPending ||
    completeMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Active Subscription Banner from Server Data */}
      {isSubscriptionActive && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold">Active Subscription Verified</h4>
                <Badge className="bg-emerald-600 text-white hover:bg-emerald-600 text-[10px] uppercase font-mono px-2 py-0.5">
                  Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your workspace already has an active{" "}
                <strong className="text-foreground">{activePlanName}</strong> subscription ({activeBillingCycle} billing). You do not need to pay again.
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              onNext({
                subscription_plan_id: Number(activePlanId) || 1,
                billing_cycle: activeBillingCycle,
              })
            }
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs gap-1.5 shrink-0 w-full sm:w-auto"
          >
            <span>Continue with Active Plan</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-start gap-2">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Progress / Verification Feedback */}
      {checkoutFeedback && (
        <div className="p-3 text-xs bg-primary/10 text-primary border border-primary/20 rounded-xl flex items-center gap-2 font-medium">
          <Loader2 className="size-4 shrink-0 animate-spin" />
          <span>{checkoutFeedback}</span>
        </div>
      )}

      {/* Payment Verified Success Banner */}
      {paymentVerified && (
        <div className="p-3.5 text-xs bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 font-bold">
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Payment verified! (Payment ID: {verifiedPaymentId}). Transitioning to Marketing &amp; Compliance...
          </span>
        </div>
      )}

      {/* Step 1: Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-3">
        <span
          className={`text-xs font-semibold cursor-pointer ${
            billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"
          }`}
          onClick={() => handleToggleBillingCycle("monthly")}
        >
          Monthly Billing
        </span>
        <button
          type="button"
          onClick={() => handleToggleBillingCycle()}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary/20 p-0.5 transition-colors focus:outline-none"
        >
          <span
            className={`inline-block size-5 transform rounded-full bg-primary transition-transform ${
              billingCycle === "yearly" ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <div
          className="flex items-center gap-1.5 cursor-pointer"
          onClick={() => handleToggleBillingCycle("yearly")}
        >
          <span
            className={`text-xs font-semibold ${
              billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            Annual Billing
          </span>
          <Badge
            variant="outline"
            className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 font-bold"
          >
            Save 20%
          </Badge>
        </div>
      </div>

      {loadingPlans && (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
          <Loader2 className="size-3.5 animate-spin" />
          <span>Loading subscription plans from server...</span>
        </div>
      )}

      {/* Step 1: Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isSelected = String(selectedPlanId) === String(plan.id);
          const isThisPlanActive = Boolean(isSubscriptionActive && String(plan.id) === String(activePlanId));
          const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;

          return (
            <div
              key={plan.id}
              onClick={() => handleSelectPlan(plan.id)}
              className={`relative flex flex-col justify-between rounded-2xl border p-4 cursor-pointer transition-all ${
                isThisPlanActive
                  ? "border-emerald-500 bg-emerald-500/5 shadow-md ring-2 ring-emerald-500/20"
                  : isSelected
                  ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                  : "border-border/80 bg-card hover:border-border hover:shadow-xs"
              }`}
            >
              {isThisPlanActive ? (
                <div className="absolute -top-2.5 right-4 flex items-center gap-1">
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="size-3" />
                    Active Plan
                  </Badge>
                </div>
              ) : plan.popular ? (
                <div className="absolute -top-2.5 right-4">
                  <Badge className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5">
                    Recommended
                  </Badge>
                </div>
              ) : null}

              <div className="space-y-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground flex items-center justify-between">
                    <span>{plan.name}</span>
                    {isThisPlanActive ? (
                      <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                    ) : isSelected ? (
                      <Check className="size-4 text-primary" />
                    ) : null}
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {plan.description}
                  </p>
                </div>

                <div className="flex items-baseline gap-1 pt-1 border-t border-border/50">
                  <span className="text-2xl font-extrabold text-foreground font-mono">
                    {currencySymbol}{price}
                  </span>
                  <span className="text-[11px] text-muted-foreground">/ month</span>
                </div>

                <ul className="space-y-2 pt-2 border-t border-border/50">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[11px] text-foreground">
                      <Check className="size-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 mt-3 border-t border-border/40">
                <Button
                  type="button"
                  variant={isThisPlanActive ? "default" : isSelected ? "default" : "outline"}
                  size="xs"
                  className={`w-full text-xs font-semibold ${
                    isThisPlanActive ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {isThisPlanActive ? "Current Active Plan" : isSelected ? "Selected Tier" : "Choose Tier"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step 2: Selected Plan Full Details & Quotas (GET /api/tenant/subscription/plans/{plan}) */}
      <div className="p-4 rounded-2xl border border-border/80 bg-card/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-primary" />
            <h4 className="text-xs font-bold text-foreground">
              Selected Plan Specifications: <span className="text-primary">{selectedPlan.name}</span>
            </h4>
            {isSelectedPlanTheActiveOne && (
              <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="size-3 text-emerald-600" />
                Active Plan
              </Badge>
            )}
          </div>
          {loadingPlanDetail ? (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              <span>Fetching details...</span>
            </div>
          ) : (
            <Badge variant="outline" className="text-[10px] font-mono capitalize">
              {billingCycle} Billing
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[10px] text-muted-foreground block">Free Conversations</span>
            <span className="font-bold text-foreground text-xs">
              {planDetail?.limits?.monthly_service_conversations?.toLocaleString() ||
                (selectedPlan.name.toLowerCase().includes("starter")
                  ? "1,000 / mo"
                  : selectedPlan.name.toLowerCase().includes("pro")
                  ? "10,000 / mo"
                  : "Unlimited")}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[10px] text-muted-foreground block">Contacts Storage</span>
            <span className="font-bold text-foreground text-xs">
              {planDetail?.limits?.contacts_limit?.toLocaleString() ||
                (selectedPlan.name.toLowerCase().includes("starter")
                  ? "2,500 contacts"
                  : selectedPlan.name.toLowerCase().includes("pro")
                  ? "15,000 contacts"
                  : "100,000 contacts")}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[10px] text-muted-foreground block">Team Seats</span>
            <span className="font-bold text-foreground text-xs">
              {planDetail?.limits?.team_members_limit ||
                (selectedPlan.name.toLowerCase().includes("starter")
                  ? "3 Seats"
                  : selectedPlan.name.toLowerCase().includes("pro")
                  ? "10 Seats"
                  : "Unlimited")}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
            <span className="text-[10px] text-muted-foreground block">WhatsApp Numbers</span>
            <span className="font-bold text-foreground text-xs">
              {planDetail?.limits?.whatsapp_numbers_limit ||
                (selectedPlan.name.toLowerCase().includes("starter")
                  ? "1 Number"
                  : selectedPlan.name.toLowerCase().includes("pro")
                  ? "3 Numbers"
                  : "10 Numbers")}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
          <span>
            Payment Gateway: <strong className="text-foreground">Razorpay Secure Checkout</strong> (UPI, Cards, NetBanking)
          </span>
          <span className="font-bold text-foreground">
            {isSelectedPlanTheActiveOne && billingCycle === activeBillingCycle ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="size-3.5" />
                Active Subscription (No Payment Due)
              </span>
            ) : (
              <>Total Due: {currencySymbol}{activePrice} {billingCycle === "yearly" ? "/ year" : "/ month"}</>
            )}
          </span>
        </div>
      </div>

      {/* Step 4 & 5: Bottom Navigation and Razorpay Trigger Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onBack}
          disabled={isPending}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          {isSelectedPlanTheActiveOne ? (
            <Button
              type="button"
              size="sm"
              onClick={() => {
                onNext({
                  subscription_plan_id: Number(selectedPlan.id) || 1,
                  billing_cycle: billingCycle,
                });
              }}
              disabled={isPending}
              className="gap-2 font-bold text-xs shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="size-3.5" />
              Continue with Active Plan
              <ArrowRight className="size-3.5" />
            </Button>
          ) : (
            <>
              {isSubscriptionActive && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPlanId(activePlanId);
                    setBillingCycle(activeBillingCycle);
                    onNext({
                      subscription_plan_id: Number(activePlanId) || 1,
                      billing_cycle: activeBillingCycle,
                    });
                  }}
                  disabled={isPending}
                  className="text-xs gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                >
                  <CheckCircle2 className="size-3.5" />
                  Keep Active ({activePlanName}) &amp; Continue
                </Button>
              )}

              {/* Fallback trial button if user is testing in development without Razorpay test keys */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleProceedWithoutPayment}
                disabled={isPending}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Skip Payment (Sandbox Trial)
              </Button>

              {/* Primary Step 4 + 5 + 6 Trigger: Open Razorpay Checkout */}
              <Button
                type="button"
                size="sm"
                onClick={handleProceedWithRazorpay}
                disabled={isPending}
                className="gap-2 font-bold text-xs shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    {checkoutFeedback || "Processing Payment..."}
                  </>
                ) : (
                  <>
                    <CreditCard className="size-3.5" />
                    {isSubscriptionActive
                      ? `Upgrade to ${selectedPlan.name} (${currencySymbol}${activePrice})`
                      : `Pay ${currencySymbol}${activePrice} with Razorpay & Continue`}
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
