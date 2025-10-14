# GroupTech - A communication application with a grouping algorithm for students

Grouptech is created using Python and React. The main purpose of the application is to place students into groups. Once the groups are made it creates group chats for students based on factors such as previous performance including grades, contribution percentages in previous projects, number of projects, etc. These chats can only be seen by the students in the group and staff.

    Note on Project History: The core development for this project took place in 2024. The repository was created and the code was uploaded in 2025, which is why the commit history does not fully reflect the original development timeline.

## Login Page

![Login Page](https://github.com/user-attachments/assets/4c5cc4c8-582a-46fd-a5e5-b5634a9db51d)

### Portal options:
 - Staff Login
 - Student Login
(Staff members have different rights and functionality)

### Users:
 - Staff - can look at all module chats, including private group chats, can't use grouping algorithm
 - Student - can use grouping algorithm, can't see staff chats, only sees public chats and messages in their private group chat

---

## Global Features

### Functional Profiles

![Profile Panel](https://github.com/user-attachments/assets/b5882b95-1013-4634-888b-441d23f4dcf7)

![Profile Button](https://github.com/user-attachments/assets/6be493d0-45b5-455f-896d-8e53266e19b9)

Each user has a profile. Profiles are accessible via the clickable profile pictures at the top (left of the nav bar). Users can look at their own profile and edit it.
The following can be changed:
-	Status – Online, Do Not Disturb, Away, Invisible, Offline
-	Profile Picture – users can change their profile picture and everyone in their chats sees their profile picture, this can be done via the avatar change button
  
The following user information has been relocated to the profile section:
-	Role – Staff, Student is shown when the user clicks in their profile
-	Programme – The name of the user’s programme is shown once the profile is clicked

### Notifications

A section at the top right corner of the screen has been created, similar to the profiles section. This section shows notifications. Notifications are clickable. Once the notification is clicked the chat appears.

![Notifications Section](https://github.com/user-attachments/assets/5c655721-fc54-45e2-b19e-eae0580255ef)

When users receive a text message they get a popup notification at the bottom right corner of their screen.

![Notifications List](https://github.com/user-attachments/assets/2f5f3d8c-b222-4a1f-b199-47652c9f0063)

---

## Groups Page

![Groups Page](https://github.com/user-attachments/assets/c06fdc8b-9550-4a4a-a479-b6bf88b85642)

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

### Potential future work:
 - Admin panel (staff only) - allows for staff to make changes and keeps a log of all changes made with timestamps.
 - Admin message/group view (staff only) - allows staff to delete messages directly and edit groups, delete messages and remove users
 - Assignment system (staff only) - allows staff to give assignments to users (includes individual assignments, assignments with groups of students)
 - Grouping algorithm tweaks to improve assignment system - Each assignment allows staff to set a mode for the algorithm(useful if staff wants to test students' performance in different environments and scenarios). The Algorithm's settings should include the following options:
      - Equality (help form groups with users who should be able to complete the task based on their total score) - aim to form groups within a certain amount of points and create a group as long as the users who are in the queue meet the point requirement just like the current system does
      - Focus (help staff focus on whole groups of students at a time - students who perform worse would require more help and feedback, etc.) - aim to form groups of students with similar system scores (if a student performs well they would be assigned into a group with other students who perform similar to them)
      - Random - completely random group selection
 - Add types of assignments - individual, group option 1 (users must use the queue system to get put into a group), group option 2 (allows users to choose up to x people to queue up together to find y people to create a group, queues of 2, 3, etc.)
 - Manual group request - allows users to request to be manually assigned to a group by staff
 - Manual group change request - allows users to request to be put in another group (in case they are not satisfied with their current group)
 - Report system - allows users to report members and send reports to staff
 - Schedule system - allows users to check their assignment timetable
 - Voicechat for each group and for direct messages
 - Screenshare while in voicechat
