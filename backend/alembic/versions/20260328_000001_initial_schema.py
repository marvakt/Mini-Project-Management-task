"""Initial schema.

Revision ID: 20260328_000001
Revises:
Create Date: 2026-03-28 00:00:01
"""

from alembic import op
import sqlalchemy as sa


revision = "20260328_000001"
down_revision = None
branch_labels = None
depends_on = None


user_role_enum = sa.Enum("ADMIN", "DEVELOPER", name="userrole")
task_status_enum = sa.Enum("TODO", "IN_PROGRESS", "DONE", name="taskstatus")


def upgrade() -> None:
    """Create the initial project management schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    user_role_enum.create(bind, checkfirst=True)
    task_status_enum.create(bind, checkfirst=True)

    if not inspector.has_table("users"):
        op.create_table(
            "users",
            sa.Column("id", sa.Uuid(), nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("hashed_password", sa.String(length=255), nullable=False),
            sa.Column("role", user_role_enum, nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint("id"),
        )

    if "ix_users_email" not in {index["name"] for index in inspector.get_indexes("users")}:
        op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    if not inspector.has_table("projects"):
        op.create_table(
            "projects",
            sa.Column("id", sa.Uuid(), nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("description", sa.String(length=1000), nullable=True),
            sa.Column("created_by", sa.Uuid(), nullable=False),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
            sa.PrimaryKeyConstraint("id"),
        )

    if not inspector.has_table("project_members"):
        op.create_table(
            "project_members",
            sa.Column("project_id", sa.Uuid(), nullable=False),
            sa.Column("user_id", sa.Uuid(), nullable=False),
            sa.ForeignKeyConstraint(["project_id"], ["projects.id"]),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
            sa.PrimaryKeyConstraint("project_id", "user_id"),
        )

    if not inspector.has_table("tasks"):
        op.create_table(
            "tasks",
            sa.Column("id", sa.Uuid(), nullable=False),
            sa.Column("title", sa.String(length=255), nullable=False),
            sa.Column("description", sa.String(length=1000), nullable=True),
            sa.Column("status", task_status_enum, nullable=False),
            sa.Column("project_id", sa.Uuid(), nullable=False),
            sa.Column("assigned_to", sa.Uuid(), nullable=True),
            sa.Column("due_date", sa.Date(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=False),
            sa.Column("updated_at", sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(["assigned_to"], ["users.id"]),
            sa.ForeignKeyConstraint(["project_id"], ["projects.id"]),
            sa.PrimaryKeyConstraint("id"),
        )


def downgrade() -> None:
    """Drop the project management schema."""
    bind = op.get_bind()

    op.drop_table("tasks")
    op.drop_table("project_members")
    op.drop_table("projects")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")

    task_status_enum.drop(bind, checkfirst=True)
    user_role_enum.drop(bind, checkfirst=True)
