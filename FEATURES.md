# Features


## Feature Introduction

The base version of Covey.Town lacks an invitation system that allows users to both invite and accept invitations from their friends. To increase the interactivity between users, we added such a system. To invite a user, a user can direct the invite tab at the bottom of the app. Under this tab, he/she can either click the invite button next to his/her friend or copy the invitation link and send it to the friend via social media. On the one hand, to accept invitations for a user currently on the town list page (the user has already created a username), he/she can view all invitations sent by others from the town invitation box and choose to accept or deny any invitation. On the other hand, for a user who hasn't created a username, he/she can use an invitation link to join the Covey.Town: the link will direct him/her to a page asking for a username and display the town name that he/she is entering.

##  Table of Contents
  
  
- [Features](#Features )
  - [Table of Contents](#table-of-contents )
  - [The town join pipeline ](#The-town-join-pipeline  )
  - [Feature Introduction](#Feature-Introduction )
  - [Identifier of a user: username](#identifier-of-a-user-username )
  - [Navigation Bar:](#Navigation-Bar)
  - [Inviting Users:](#Inviting-Users )
  - [Accepting Invitations:](#Accepting-Invitations)

## The town join pipeline 
<img src="docs/pipeline2.png" alt="drawing" width="600"/>


## Identifier of a user: username

Since the invitation system needs something to keep track of user identification, we will always ask for a username before a user enters a town.

### The first page of the app:

![](docs/Picture1.png)

### The landing page when user use a invitation link to join:

![](docs/Picture2.png)

## Navigation Bar:

Once the user logged in with a username, he/she will see a navigation bar at the top of the page.

1.	Town List Button: This button is unclickable unless a user has already joined a town. Clicking this button will make the user quit the room and navigate him/her to the town list page.
2.	Logout Button: If a user clicks this button, he/she will go back to the first page of the app, which is the page asking for a username. He/she will no longer be visible to other users that are already in a town.
3.	Town Invitations Dropdown: A user can view all invitations and choose to accept or deny any of them in this dropdown menu.

### Navigation Bar:
![](docs/Picture3.png)

## Inviting Users:

After a user joins a town, he/she will see an invite button at the bottom right of the app page:

![](docs/Picture4.png)

Clicking the button will make an invitation window prompt out as following:

![](docs/Picture5.png)

1.	Invite IN-SYSTEM Users:
IN-SYSTEM users are considered as those who have already created their usernames. On this window, a user can view all IN-SYSTEM users. He/she can invite by simply clicking the invite button next to a user.

### To invite IN-SYSTEM user:
![](docs/Picture6.png)

2.	Invite OUT-SYSTEM
OUT-SYSTEM users are considered as those who have not created their usernames yet. Again, on this window, a user can copy the invitation link and send it to others via social media.

### To invite OUT-SYSTEM user:
![](assets/Picture7.png)

![](docs/Picture8.png)

## Accepting Invitations:
1.	Join as IN-SYSTEM User:
As stated above, IN-SYSTEM users are able to view all invitations from the Town Invitation dropdown menu.

He/She can take actions by simply clicking the accept or deny button.

![](docs/Picture9.png)

2.	Join as OUT-SYSTEM User:
Once received an invitation link, an OUT-SYSTEM user can copy the link and paste it into a browser. This link will navigate him/her to a page asking for a username to enter, displaying the town name that the user is currently joining, as stated above. After creating the username, the user will directly get into the town.














