"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  UserPlus,
  Users,
  Shield,
  MessageSquare,
  RefreshCw,
} from "lucide-react";
import type { TeamMember, TeamMemberRole, TeamMemberAvailability } from "@/types/team";
import {
  useUpdateMemberRoleMutation,
  useDeactivateMemberMutation,
  useReactivateMemberMutation,
  useUpdateAvailabilityMutation,
} from "../hooks";
import { MemberDeactivateDialog } from "./member-deactivate-dialog";
import { InviteMemberModal } from "./invite-member-modal";
import { formatRelativeTime } from "@/lib/formatters";

interface TeamMembersTableProps {
  members: TeamMember[];
  isLoading: boolean;
  onRefresh?: () => void;
  onInvite?: () => void;
}

export function TeamMembersTable({
  members,
  isLoading,
  onRefresh,
  onInvite,
}: TeamMembersTableProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);

  const updateRoleMutation = useUpdateMemberRoleMutation();
  const deactivateMutation = useDeactivateMemberMutation();
  const reactivateMutation = useReactivateMemberMutation();
  const updateAvailabilityMutation = useUpdateAvailabilityMutation();

  const filteredMembers = React.useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        searchTerm === "" ||
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || member.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && member.is_active) ||
        (statusFilter === "inactive" && !member.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [members, searchTerm, roleFilter, statusFilter]);

  const handleRoleChange = async (memberId: string | number, newRole: TeamMemberRole) => {
    try {
      await updateRoleMutation.mutateAsync({
        id: memberId,
        data: { role: newRole },
      });
    } catch {
      // Handled by query mutation error
    }
  };

  const handleAvailabilityChange = async (
    memberId: string | number,
    availability: TeamMemberAvailability
  ) => {
    try {
      await updateAvailabilityMutation.mutateAsync({
        id: memberId,
        availability,
      });
    } catch {
      // Handled by query mutation error
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!selectedMember) return;
    try {
      if (selectedMember.is_active) {
        await deactivateMutation.mutateAsync(selectedMember.id);
      } else {
        await reactivateMutation.mutateAsync(selectedMember.id);
      }
      setSelectedMember(null);
    } catch {
      // Handled by query mutation error
    }
  };

  const isPendingStatus =
    deactivateMutation.isPending || reactivateMutation.isPending;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "admin":
        return "bg-primary/10 text-primary border-primary/20";
      case "agent":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "viewer":
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search team members by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs bg-background"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Administrator</option>
            <option value="agent">Support Agent</option>
            <option value="viewer">Viewer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Members</option>
            <option value="inactive">Deactivated</option>
          </select>

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-9 w-9 p-0"
              title="Refresh team members"
            >
              <RefreshCw className="size-3.5" />
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => {
              if (onInvite) onInvite();
              else setIsInviteOpen(true);
            }}
            className="h-9 gap-1.5 text-xs font-semibold shadow-xs"
          >
            <UserPlus className="size-4" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="text-xs font-bold text-foreground">Member</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Role</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Availability</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Status</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Assigned Chats</TableHead>
              <TableHead className="text-xs font-bold text-foreground">Last Active</TableHead>
              <TableHead className="text-xs font-bold text-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell colSpan={7}>
                    <div className="h-6 bg-muted/40 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-44 text-center">
                  <div className="max-w-xs mx-auto space-y-2">
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                      <Users className="size-5" />
                    </div>
                    <p className="font-semibold text-xs text-foreground">No members found</p>
                    <p className="text-[11px] text-muted-foreground">
                      {searchTerm
                        ? "Try adjusting your search criteria."
                        : "Invite team members to assign conversations and share inbox workloads."}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsInviteOpen(true)}
                      className="mt-2 text-xs"
                    >
                      Invite First Member
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.id} className="hover:bg-muted/20 transition-colors">
                  {/* Name and Email */}
                  <TableCell className="align-middle py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-semibold text-xs text-foreground block">
                          {member.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground block font-mono">
                          {member.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Role Selector / Badge */}
                  <TableCell className="align-middle py-3">
                    {member.role === "owner" ? (
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold uppercase tracking-wider ${getRoleBadgeVariant(
                          member.role
                        )}`}
                      >
                        <Shield className="size-3 mr-1" />
                        Owner
                      </Badge>
                    ) : (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member.id, e.target.value as TeamMemberRole)
                        }
                        disabled={updateRoleMutation.isPending}
                        className="h-7 rounded-md border border-input bg-background px-2 text-[11px] font-semibold text-foreground cursor-pointer"
                      >
                        <option value="admin">Admin</option>
                        <option value="agent">Agent</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    )}
                  </TableCell>

                  {/* Availability Dropdown */}
                  <TableCell className="align-middle py-3">
                    <select
                      value={member.availability}
                      onChange={(e) =>
                        handleAvailabilityChange(
                          member.id,
                          e.target.value as TeamMemberAvailability
                        )
                      }
                      className="h-7 rounded-md border border-input bg-background px-2 text-[11px] font-medium text-foreground cursor-pointer"
                    >
                      <option value="online">🟢 Online</option>
                      <option value="busy">🟡 Busy</option>
                      <option value="offline">⚪ Offline</option>
                    </select>
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="align-middle py-3">
                    {member.is_active ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-semibold"
                      >
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-semibold"
                      >
                        Deactivated
                      </Badge>
                    )}
                  </TableCell>

                  {/* Assigned Conversations */}
                  <TableCell className="align-middle py-3 text-xs font-mono">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MessageSquare className="size-3 text-primary" />
                      {member.assigned_conversations_count ?? 0}
                    </span>
                  </TableCell>

                  {/* Last Active */}
                  <TableCell className="align-middle py-3 text-xs text-muted-foreground">
                    {member.last_active_at
                      ? formatRelativeTime(member.last_active_at)
                      : "Never"}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right align-middle py-3">
                    {member.role !== "owner" && (
                      <Button
                        variant={member.is_active ? "ghost" : "outline"}
                        size="sm"
                        onClick={() => setSelectedMember(member)}
                        className={`h-7 text-xs font-semibold ${
                          member.is_active
                            ? "text-muted-foreground hover:text-rose-600"
                            : "text-emerald-600 hover:text-emerald-700"
                        }`}
                      >
                        {member.is_active ? "Deactivate" : "Reactivate"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={onRefresh}
      />

      {/* Deactivate/Reactivate Confirmation Dialog */}
      <MemberDeactivateDialog
        member={selectedMember}
        isOpen={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
        onConfirm={handleConfirmDeactivate}
        isPending={isPendingStatus}
      />
    </div>
  );
}
