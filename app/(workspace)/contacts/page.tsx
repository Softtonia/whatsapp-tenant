"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ContactsTable } from "@/features/contacts/components/contacts-table";
import { ContactFormModal } from "@/features/contacts/components/contact-form-modal";
import { ContactDetailsDrawer } from "@/features/contacts/components/contact-details-drawer";
import { ContactImportModal } from "@/features/contacts/components/contact-import-modal";
import { LeadsKanbanBoard } from "@/features/leads/components/leads-kanban-board";
import type { Contact } from "@/types/contact";
import { Users, Kanban, Upload, Plus } from "lucide-react";

export default function ContactsPage() {
  const [viewTab, setViewTab] = useState<"contacts" | "leads">("contacts");

  // Contact Drawer & Modals state
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDrawerOpen(true);
  };

  const handleOpenCreateContact = () => {
    setContactToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditContact = (contact: Contact) => {
    setContactToEdit(contact);
    setIsFormModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Contacts & Leads"
        description="Manage verified WhatsApp opt-ins, tags, and sales opportunities"
        breadcrumbs={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Contacts & Leads" },
        ]}
      >
        {viewTab === "contacts" ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 text-xs font-semibold"
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload className="size-3.5" />
              <span>Import CSV</span>
            </Button>
            <Button
              size="sm"
              className="h-9 gap-1.5 text-xs font-semibold"
              onClick={handleOpenCreateContact}
            >
              <Plus className="size-3.5" />
              <span>Add Contact</span>
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            className="h-9 gap-1.5 text-xs font-semibold"
            onClick={handleOpenCreateContact}
          >
            <Plus className="size-3.5" />
            <span>Add Lead</span>
          </Button>
        )}
      </PageHeader>

      {/* Primary Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-px">
        <button
          type="button"
          onClick={() => setViewTab("contacts")}
          className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
            viewTab === "contacts"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="size-4" />
          <span>Contacts Directory</span>
        </button>

        <button
          type="button"
          onClick={() => setViewTab("leads")}
          className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
            viewTab === "leads"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Kanban className="size-4" />
          <span>Lead Pipeline (Kanban)</span>
        </button>
      </div>

      {/* Tab Panels */}
      {viewTab === "contacts" ? (
        <ContactsTable
          onSelectContact={handleSelectContact}
          onEditContact={handleOpenEditContact}
        />
      ) : (
        <LeadsKanbanBoard />
      )}

      {/* Modals & Drawers */}
      <ContactFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setContactToEdit(null);
        }}
        contactToEdit={contactToEdit}
      />

      <ContactDetailsDrawer
        contact={selectedContact}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedContact(null);
        }}
        onEdit={(c) => {
          setIsDrawerOpen(false);
          handleOpenEditContact(c);
        }}
      />

      <ContactImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
