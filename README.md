# GroupTech - A communication application with a grouping algorithm for students

Grouptech is created using Python and React. The main purpose of the application is to place students into groups. Once the groups are made it creates group chats for students based on factors such as previous performance including grades, contribution percentages in previous projects, number of projects, etc. These chats can only be seen by the students in the group and staff.

    Note on Project History: The core development for this project took place in 2024. The repository was created and the code was uploaded in 2025, which is why the commit history does not fully reflect the original development timeline.

## Login Page

![Login Page](https://github.com/user-attachments/assets/d9d13816-486d-4ec0-ae8a-ca27e2a30826)

### Portal options:
 - Staff Login
 - Student Login
(Staff members have different rights and functionality)

### Users:
 - Staff - can look at all module chats, including private group chats, can't use grouping algorithm
 - Student - can use grouping algorithm, can't see staff chats, only sees public chats and messages in their private group chat

---

## Groups Page

![Grousp Page](https://github.com/user-attachments/assets/9028ff34-f6cb-4d5a-88ac-0b19f379d164)

### Features:
 - Modules - users can go to their specific subject modules
 - Channels - each module has different text channels
    - Sending Messages and attachments (A message can contain multiple files, text, and images. Messages have image preview/download options)
    - Deleting/editing Messages (Messages are automatically updated in real time once edited/deleted for everyone looking at the chat)
 - Group Queue(students only) - students can use the algorithm to find a group based on factors including grades and contribution to projects
 - Group Chats(specific students and staff only) -  the grouping algorithm finds groups for students and creates a private group chat visible to group members(determined by algorithm) and staff members are allowed to view messages and moderate it

---

## Direct Messages Page

![Direct Messages Page](https://github.com/user-attachments/assets/d42f127c-4a83-44a1-982c-237d106ab60d)

Users can send each other private messages. They are also allowed to edit or delete their own messages. Message updates (edited and deleted messages) display in real time after change.

---

## Settings Page

![Settings Page](https://github.com/user-attachments/assets/cc0c5271-eaf8-4119-8a38-51e32d2510df)

### Features:
 - Theme change - users can select between theme presets
 - Custom theme creation - users can create custom themes and adjust every single color and the background image of the application

---
