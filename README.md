# udn-comms

CT is a messenger and task management application built for [UDN](https://github.com/marlon-erler/udn).

# Core Features

- Offline support, updates download in background
- Messaging including reactions, inline replies, and message-replies-only view
- Task management with Kanban and Status Grid view
- Calendar for tasks
- Data transfer and export/import for identity, connections, and chats

# Changes

## 2610: (October 11th, 2026) Initial Release
This application is a rebrand of Comms, whose development started in July 2024. Changelogs or versioning have not been present initially and were never standardized. The CT repository is a fork of Comms. Changes made between the lastest iteration of Comms and CT 2610 include:
- Account and chat identity
    - Use a randomized UUID to identify users instead of manually entered names
    - Integrate a contacts model to keep track of who sent messages, and to reflect name changes
    - Replace primary channels and namespaces with randomized UUIDs and chat names, sync chat settings (name, color, secondary channels)
- UI improvements:
    - Show how much storage is used and remaining in storage management view
    - Show data transfer progress
    - Layout improvements
