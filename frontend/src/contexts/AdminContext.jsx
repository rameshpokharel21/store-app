import { createContext, useContext, useState } from "react";

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditRolesModalOpen, setIsEditRolesModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const openCreateModal = () => setIsCreateModalOpen(true);
    const closeCreateModal = () => setIsCreateModalOpen(false);

    const openEditRolesModal = (user) => {
        setSelectedUser(user);
        setIsEditRolesModalOpen(true);
    };
    const closeEditRolesModal = () => {
        setIsEditRolesModalOpen(false);
        setSelectedUser(null);
    };

    const openDeleteConfirm = (user) => {
        setSelectedUser(user);
        setIsDeleteConfirmOpen(true);
    };
    const closeDeleteConfirm = () => {
        setIsDeleteConfirmOpen(false);
        setSelectedUser(null);
    };

    return (
        <AdminContext value={{
            selectedUser,
            isCreateModalOpen,
            isEditRolesModalOpen,
            isDeleteConfirmOpen,
            searchTerm,
            setSearchTerm,
            openCreateModal,
            closeCreateModal,
            openEditRolesModal,
            closeEditRolesModal,
            openDeleteConfirm,
            closeDeleteConfirm,
        }}>
            {children}
        </AdminContext>
    );
};

export const useAdminContext = () => {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error("useAdminContext must be used inside AdminProvider");
    return ctx;
};
