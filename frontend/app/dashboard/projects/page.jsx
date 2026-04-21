"use client";

import { useState, useEffect } from "react";
import { useProjects } from "@/hooks/useProjects";
import { CreateTaskButton, SectionHeading, PlusIcon, StatusBadge } from "@/components/dashboard-ui";
import { ProjectCard } from "@/components/ProjectCard";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { authApi } from "@/lib/auth";

export default function ProjectsPage() {
  const { projects, loading, error, createProject, deleteProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectLoading, setNewProjectLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        if (authApi.isAuthenticated()) {
          const user = await authApi.getCurrentUser();
          if (isMounted) setCurrentUser(user);
        }
      } catch (err) {
        console.error("Failed to load user", err);
      }
    };
    fetchUser();
    return () => { isMounted = false; };
  }, []);

  const isAdmin = currentUser?.role === "admin";

  const handleCreateProject = async (data) => {
    try {
      setNewProjectLoading(true);
      await createProject(data.name || data.title, data.description, data.member_ids || []);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setNewProjectLoading(false);
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="p-8">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-700 p-4 border-2 border-red-200 rounded-md">
          <h3 className="font-bold uppercase tracking-widest text-xs mb-1">Error Loading Projects</h3>
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <SectionHeading
          title="All Projects"
          subtitle="Manage your team's initiatives and track overall progress." 
        />
        {isAdmin && (
          <CreateTaskButton onClick={() => setIsModalOpen(true)}>
            New Project
          </CreateTaskButton>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-24 px-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
          <div className="mx-auto w-16 h-16 bg-white border-2 border-gray-200 flex items-center justify-center rounded-full mb-4">
            <PlusIcon className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-lg font-bold text-black mb-2 uppercase tracking-wide">No projects found</h3>
          <p className="text-gray-500 font-medium mb-6">
            {isAdmin ? "Get started by creating your first project." : "You have not been added to any projects yet."}
          </p>
          {isAdmin && (
            <CreateTaskButton onClick={() => setIsModalOpen(true)}>
              Create Project
            </CreateTaskButton>
          )}
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">  
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              isAdmin={isAdmin}
              onDelete={deleteProject}
            />
          ))}
        </div>
      )}

      {/* Basic Create Project Modal */}
      {isAdmin && (
        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateProject}
        />
      )}
    </div>
  );
}
