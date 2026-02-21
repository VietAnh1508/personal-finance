# US-WEB-013: Implement Category Management in PWA

## User Story
As a user,
I want to manage transaction categories in the web app,
so that I can keep my transaction classification accurate and useful.

## Acceptance Criteria
1. User can view predefined categories (initial examples include Groceries, House renting, Transportation).
2. User can create a new category with required validation rules and edit existing categories.
3. User can archive categories (not hard delete), and archived categories remain linked to historical transactions.
4. Archived categories are hidden by default and can be shown via a toggle in category management UI.
5. Add/edit transaction flows use the latest active category set while preserving archived-category references on existing records.
6. Category changes persist locally and participate in sync workflow.
