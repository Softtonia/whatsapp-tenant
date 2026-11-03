"use client";

import * as React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserPlus,
  Mail,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import {
  useTeamMembersQuery,
  useTeamInvitationsQuery,
} from "@/features/team/hooks";
import { TeamMembersTable } from "@/features/team/components/team-members-table";
import { TeamInvitationsTable } from "@/features/team/components/team-invitations-table";
import { InviteMemberModal } from "@/features/team/components/invite-member-modal";

export default function TeamPage() {
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);

  const {
    data: membersData,
    isLoading: loadingMembers,
    refetch: refetchMembers,
  } = useTeamMembersQuery();

  const {
    data: invitations,
    isLoading: loadingInvitations,
    refetch: refetchInvitations,
  } = useTeamInvitationsQuery();

  const members = membersData?.data || [];
  const invitesList = invitations || [];

  const activeMembersCount = members.filter((m) => m.is_active).length;
  const onlineAgentsCount = members.filter(
    (m) => m.is_active && m.availability === "online"
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Team & Access Management"
        description="Manage agents, administrator permissions, real-time availability, and pending email invitations."
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Team Members" },
        ]}
      >
        <Button
          onClick={() => setIsInviteOpen(true)}
          size="sm"
          className="gap-2 text-xs font-semibold shadow-xs"
        >
          <UserPlus className="size-4" />
          Invite Team Member
        </Button>
      </PageHeader>

      {/* Team KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-card border border-border/80 rounded-xl space-y-1 shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground">Total Members</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">{members.length}</span>
            <Users className="size-4 text-primary" />
          </div>
        </div>

        <div className="p-3.5 bg-card border border-border/80 rounded-xl space-y-1 shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground">Active Seats</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-success">
              {activeMembersCount}
            </span>
            <UserCheck className="size-4 text-success" />
          </div>
        </div>

        <div className="p-3.5 bg-card border border-border/80 rounded-xl space-y-1 shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground">Online Agents</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-success flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-success animate-pulse" />
              {onlineAgentsCount}
            </span>
            <CheckCircle2 className="size-4 text-success" />
          </div>
        </div>

        <div className="p-3.5 bg-card border border-border/80 rounded-xl space-y-1 shadow-xs">
          <span className="text-[11px] font-medium text-muted-foreground">Pending Invites</span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">{invitesList.length}</span>
            <Mail className="size-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Tabs for Members and Invitations */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList className="grid w-full sm:w-[380px] grid-cols-2 h-10">
          <TabsTrigger value="members" className="text-xs font-semibold gap-1.5">
            <Users className="size-3.5" />
            Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="text-xs font-semibold gap-1.5">
            <Mail className="size-3.5" />
            Pending Invitations ({invitesList.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-4">
          <TeamMembersTable
            members={members}
            isLoading={loadingMembers}
            onRefresh={() => refetchMembers()}
            onInvite={() => setIsInviteOpen(true)}
          />
        </TabsContent>

        <TabsContent value="invitations" className="mt-4">
          <TeamInvitationsTable
            invitations={invitesList}
            isLoading={loadingInvitations}
            onRefresh={() => refetchInvitations()}
          />
        </TabsContent>
      </Tabs>

      {/* Invite Modal */}
      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={() => {
          refetchMembers();
          refetchInvitations();
        }}
      />
    </div>
  );
}
