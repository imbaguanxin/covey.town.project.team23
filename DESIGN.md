# Design of Covey.Town project

## Backend

We modified the backend of Covey.Town so that it supports users and invitations

### Introduction

We added services related to user, invitation and tried to keep all the original designs. Now the join town pipeline becomes:

1. create username => select a town to join / create a town => entering town

2. use a invitaiton link => create username => entering town

Therefore, we added classes and REST api to support:

- create a user
- retrieve town information by invitationID that embedded in invitation link

In order to do invitation system, we added classes, REST api and listner to support:

- retrieve all in-system user (who created a username)
- Invite a user to a given town
- retrieve a town's invitationID
- one listener for each user that subscribes to invitation

### New REST APIs:

#### creat user:

_POST_ **/user**

```
body: {username: string}
return: {username: string, userID: string, userToken: string}
```

#### list users:

_GET_ **/user**

```
return: {users: {username: string, userID: string}[]}
```

#### get invitation id of a town

_GET_ **/invitation/:townID**

```
return: {invitationID: string}
```

#### invite a user in system

_POST_ **/invitation**

```
body: {
    conveyTownID: string,
    invitedUserID: string
}
return {}
# isOK shows whether the request is successful, therefore no response body
```

#### request a town invitation by invitation id

_GET_ **/joinInvitation/:invitationID**

```
return: {
    conveyTownID: string,
    friendlyName: string
}
```

### CRC cards

<table>
      <tr>
         <td colspan='2'><b>Class Name: ActiveUser</b></td>
      </tr>
      <tr>
        <td colspan='2'><b>States:</b>
            <ul>
                <li><b>id:</b> the unique identifier of the user</li>
                <li><b>username:</b> the username of the user</li>
                <li><b>token:</b> the token used to subscribe token</li>
            </ul>
        </td>
      </tr>
      <tr>
        <td><b>Responsibilities</b></td>
        <td><b>Collaborators</b></td>
      </tr>
      <tr>
        <td rowspan='1'>Representing a active user in the system</td>
        <td>CoveyUserController</td>
      </tr>
</table>

<table>
      <tr>
         <td colspan='2'><b>Class Name: (interface) CoveyInvitationListener</b></td>
      </tr>
      <tr>
        <td colspan='2'><b>States:</b>
            <ul>
                <li><b>id:</b> the id of this listner's owner</li>
            </ul>
        </td>
      </tr>
      <tr>
        <td><b>Responsibilities</b></td>
        <td><b>Collaborators</b></td>
      </tr>
      <tr>
        <td rowspan='2'>An listener that subscribed to invitation events. Once receieved invitation, it will notify the socket's owner the invitaiton information (coveyTownID and FriendlyName). Also it subscribes to disconnect event.</td>
        <td>CoveyUserController</td>
      </tr>
      <tr>
        <td>Socket</td>
      </tr>
</table>

<table>
      <tr>
         <td colspan='2'><b>Class Name: CoveyTownController (changed)</b></td>
      </tr>
      <tr>
        <td colspan='2'><b>Added States:</b>
            <ul>
                <li><b>invitationID:</b> the generated id for invitation (outside user)</li>
            </ul>
        </td>
      </tr>
      <tr>
        <td><b>Responsibilities</b></td>
        <td><b>Collaborators (with InvitationID)</b></td>
      </tr>
      <tr>
        <td rowspan='2'>Except for the original use, we added an invitationID to this class. User haven't launched the app may use the invitationID to identify which town the user is trying to join.</td>
        <td>CoveyTownsStore</td>
      </tr>
      <tr>
        <td>UserInvitationRequestHandlers</td>
      </tr>
</table>

<table>
      <tr>
         <td colspan='2'><b>Class Name: CoveyTownsStore (changed)</b></td>
      </tr>
      <tr>
        <td colspan='2'><b>No added states</b>
        </td>
      </tr>
      <tr>
        <td><b>Responsibilities</b></td>
        <td><b>Collaborators (with InvitationID)</b></td>
      </tr>
      <tr>
        <td rowspan='2'>Except for the original use, we added a method to find townController by InvitationID</td>
        <td>CoveyTownController</td>
      </tr>
      <tr>
        <td>UserInvitationRequestHandlers</td>
      </tr>
</table>

<table>
      <tr>
         <td colspan='2'><b>Class Name: CoveyUserController</b></td>
      </tr>
      <tr>
        <td colspan='2'><b>States:</b>
            <ul>
                <li><b>instance</b></li>
                <li><b>users:</b> The active users in the system</li>
                <li><b>listeners:</b> The invitation listeners subscribes the invitations</li>
            </ul>
        </td>
      </tr>
      <tr>
        <td><b>Responsibilities</b></td>
        <td><b>Collaborators</b></td>
      </tr>
      <tr>
        <td rowspan='4'>This class stores all existing user in the system (who have created a username). This class is managing the users, including list all users, find a specific user, create a user, delete a user. Also, CoveyUserController stores the in system invitations listeners. It sends the invitations to the given user.</td>
        <td>ActiveUser</td>
      </tr>
      <tr>
        <td>UserInvitationRequestHandlers</td>
      </tr>
      <tr>
        <td>CoveyInvitationListener</td>
      </tr>
      <tr>
        <td>Socket</td>
      </tr>
</table>

<table>
      <tr>
         <td colspan='2'><b>Class Name: UserInvitatoinRequestHandlers</b></td>
      </tr>
      <tr>
        <td colspan='2'><b>States:</b>
            <ul>
                <li><b>CoveyUserController:</b> the controller stores the user and handles invitations</li>
                <li><b>CoveyTownsStore:</b> stores all the towns</li>
            </ul>
        </td>
      </tr>
      <tr>
        <td><b>Responsibilities</b></td>
        <td><b>Collaborators</b></td>
      </tr>
      <tr>
        <td rowspan='5'>This class exports functions that handles the requests related to users and invitaitons. Including following: create a user, subscribe the new user's socket to listen to listners, list users, show the invitationID of a town, retrieve town information by invitationID, invite a existing user to a specific town</td>
        <td>CoveyTownController</td>
      </tr>
      <tr>
        <td>CoveyTownsStore</td>
      </tr>
      <tr>
        <td>CoveyUserController</td>
      </tr>
      <tr>
        <td>Socket</td>
      </tr>
      <tr>
        <td>Associating response/request interfaces</td>
      </tr>
</table>

## Frontend

We modified the frontend of Covey.Town so that it supports users and invitations.

We added services related to user, invitation and tried to keep all the original designs. We have designed to have a separated socket (user socekt) to deal with invitation activities (i.e. receive invitation from other other users) with the backend, aside from the original one dealing with town activities (town socket). Therefore, two sockets are created to capture different paths, where the town socket capturing `/town`, and the user socket capturing `/user`. The user socket is created after getting a valid response of creating a user from backend and is set to listening for `'invitedToTown'` from backend.

### CRC cards

<table>
  <tr>
    <td colspan='2'><b>Function: </b></td>
  </tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='2'></td>
    <td>Template</td>
  </tr>
  <tr><td>Template</td></tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Interface: Props</b></td>
  </tr>
  <tr colspan='2'><b>States: </b></tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='2'>This interface manages the props of </td>
    <td>Template</td>
  </tr>
  <tr><td>Template</td></tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Function: App</b></td>
  </tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='6'>According to current states, place components on the page.</td>
    <td>appStateReducer</td>
  </tr>
  <tr><td>UserCreation</td></tr>
  <tr><td>UserInvitation</td></tr>
  <tr><td>UserLinkJoin</td></tr>
  <tr><td>loginController</td></tr>
  <tr><td>Video</td></tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Function: UserCreation</b></td>
  </tr>
  <tr colspan='2'><b>States: newUserName</b></tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='3'>This page has a text input box with some welcoming messages to let user to type in a username and direct user to the town listing page after clicking the "Create" button that is also on this page.</td>
    <td>UserCreationProps</td>
  </tr>
  <tr><td>CoveyAppStates.apiClient</td></tr>
  <tr><td>App</td></tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Interface: UserCreationProps</b></td>
  </tr>
  <tr colspan='2'><b>States: doLogin</b></tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='2'>This interface manages the props of UserCreation</td>
    <td>UserCreation</td>
  </tr>
  <tr><td>CreateUserBodyResponse</td></tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Function: UserInvitation</b></td>
  </tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='4'>This components is a menu bar at the top of the page consisting of a "To Town List" button directing to the TownSelection page, a "Log out" button clearing all states back to default and direct to the UserCreation page, and a drop down list, the component "TownLink", lists all the names and IDs of towns that sent invitations to this user with a button to join the coresponding town and a button to delete the invitation.</td>
    <td>InvitationProps</td>
  </tr>
  <tr><td>GoToTownListButton</td></tr>
  <tr><td>LogoutButton</td></tr>
  <tr><td>TownLink</td></tr>
  <tr><td>App</td></tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Interface: UserInvitationProps</b></td>
  </tr>
  <tr colspan='2'><b>States: doLogin, doLogout, deleteInvitation</b></tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='2'>This interface manages the props of UserInvitation</td>
    <td>UserInvitation</td>
  </tr>
  <tr><td>TownJoinResponse</td></tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Function: TownLink</b></td>
  </tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='6'>This components is a drop down list consisiting of all the names and IDs of towns that sent invitations to this user with a button to join the coresponding town and a button to delete the invitation</td>
    <td>TownLinkProps</td>
  </tr>
  <tr><td>IVideoContext.connect</td></tr>
  <tr><td>CoveyAppState.invitations</td></tr>
  <tr><td>CoveyAppState.userName</td></tr>
  <tr><td>CoveyAppState.currentTownID</td></tr>
  <tr><td>UserInvitation</td></tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Interface: TownLinkProps</b></td>
  </tr>
  <tr colspan='2'><b>States: doLogin, deleteInvitation</b></tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='2'>This interface manages the props of TownLink</td>
    <td>UserInvitation</td>
  </tr>
  <tr><td>TownJoinResponse</td></tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Function: UserLinkJoin</b></td>
  </tr>
  <tr colspan='2'><b>States: newUserName, invitedTownID, invitedTownName</b></tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='6'>This page has similar layout and functionalities with the UserCreation, but it has a invitation token passed in the props that relates to a specific town. User would directly join the town after typing in a valid user name in the text input box and click the "Create" button.</td>
    <td>UserLinkJoinProps</td>
  </tr>
  <tr><td>CoveyAppState.invitationSocket</td></tr>
  <tr><td>CoveyAppState.townSocket</td></tr>
  <tr><td>CoveyAppState.apiClient</td></tr>
  <tr><td>IVideoContext.connect</td></tr>
  <tr><td>App</td></tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Interface: UserLinkJoinProps</b></td>
  </tr>
  <tr colspan='2'><b>States: userLogin, townLogin, params</b></tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='3'>This interface manages the props of UserLinkJoin</td>
    <td>UserLinkJoin</td>
  </tr>
  <tr><td>CreateUserBodyResponse</td></tr>
  <tr><td>TownJoinResponse</td></tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Function: loginController</b></td>
  </tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='2'>Set up a socket capturing `/user` and listening for `'invitedToTown'` from backend and update CoveyAppStates according to arguments. This function has similar functionality with GameController and should also be used similarly but has different, unrelated arguments.</td>
    <td>CreateUserBodyResponse</td>
  </tr>
  <tr><td>socket.io-client.io</td></tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Class: ServiceClient</b></td>
  </tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='5'>Construct a Service API client. Specify a serviceURL for testing, or otherwise defaults to the URL at the environmental variable REACT_APP_ROOMS_SERVICE_URL. Deal with all communications to the backend through REST API. This class was originally "TownsServiceClient".</td>
    <td>ResponseEnvelope</td>
  </tr>
  <tr><td>GetInvitationIDBodyRequest</td></tr>
  <tr><td>JoinInvitationBodyRequest</td></tr>
  <tr><td>TownUpdateRequest</td></tr>
  <tr><td>TownDeleteRequest</td></tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Interface: CreateUserBodyRequest</b></td>
  </tr>
  <tr colspan='2'><b>States: username</b></tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='1'>This interface manages the structure of the body of the POST request to `/user` creating a user.</td>
    <td>None</td>
  </tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Interface: CreateUserBodyResponse</b></td>
  </tr>
  <tr colspan='2'><b>States: username, userID, userToken</b></tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='1'>This interface manages the structure of the response of the POST request to `/user` creating a user.</td>
    <td>None</td>
  </tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Interface: ListUserBodyResponse</b></td>
  </tr>
  <tr colspan='2'><b>States: users</b></tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='1'>This interface manages the structure of the response of the GET request to `/user` listing all users.</td>
    <td>None</td>
  </tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Interface: GetInvitationIDBodyRequest</b></td>
  </tr>
  <tr colspan='2'><b>States: users</b></tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='1'>This interface manages the structure of the request of the GET request to `/invitation` requesting for invitation token from backend.</td>
    <td>ServiceClient</td>
  </tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Interface: InviteUserInSystemBodyRequest</b></td>
  </tr>
  <tr colspan='2'><b>States: coveyTownID, invitedUserID</b></tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='1'>This interface manages the structure of the request of the POST request to `/invitation` to invite a user.</td>
    <td>None</td>
  </tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Interface: JoinInvitationBodyRequest</b></td>
  </tr>
  <tr colspan='2'><b>States: invitationID</b></tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='1'>This interface manages the structure of the request of the GET request to `/invitation` requesting for information about a specific town.</td>
    <td>ServiceClient</td>
  </tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Interface: JoinInvitationBodyResponse</b></td>
  </tr>
  <tr colspan='2'><b>States: coveyTownID, friendlyName</b></tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='1'>This interface manages the structure of the response of the GET request to `/invitation` requesting for information about a specific town.</td>
    <td>ServiceClient</td>
  </tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Function: GoToTownListButton</b></td>
  </tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='3'>This component is a button that would exit current town and back to the TownSelection page upon clicking. This component should be disabled when `IVideoContext.room` is not connected since user would then either have already been on the TownSelection page or have not entered a username.</td>
    <td>IVideoContext.room</td>
  </tr>
  <tr><td>useRoomState</td></tr>
  <tr><td>UserInvitation</td></tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Function: LogoutButton</b></td>
  </tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='4'>This component is a button that would diconnect all connections, clear all states back to default, and back to the TownSelection page upon clicking. This component should be disabled exactly when `IVideoContext.room` is trying to, but have not yet, connect to twilio.</td>
    <td>IVideoContext.room</td>
  </tr>
  <tr><td>CoveyAppState.sessionToken</td></tr>
  <tr><td>useRoomState</td></tr>
  <tr><td>UserInvitation</td></tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Function: TownInvitation</b></td>
  </tr>
  <tr colspan='2'><b>States: availableUsers, invitationToken</b></tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='4'>This component is places as a button besides the TownSettings button at the bottom of the page in a town. Upon clicking, it would pop up a window showing the invitation URL and a "Copy" button that would copy the invitation URL to user's clipboard. The window would also have a list of all available users requested from the backend, each entry consisting of their name, userID, and a "Invite" button that would send a request to backend to invite the corresponding user.</td>
    <td>Video</td>
  </tr>
  <tr><td>CoveyAppState.myUserID</td></tr>
  <tr><td>CoveyAppState.currentTownID</td></tr>
  <tr><td>CoveyAppState.apiClient</td></tr>
</table>

<table>
  <tr>
    <td colspan='2'><b>Type: CoveyAppStates</b></td>
  </tr>
  <tr colspan='2'><b>States: sessionToken, userName, myUserID, myUserToken, currentTownFriendlyName, currentTownID, currentTownIsPubliclyListed, myPlayerID, players, currentLocation, nearbyPlayers, emitMovement, townSocket, invitationSocket, invitations, apiClient</b></tr>
  <tr>
    <td><b>Responsibilities:</b></td>
    <td><b>Collaborators:</b></td>
  </tr>
  <tr>
    <td rowspan='5'>This type manages the structure of all shared states in the frontend of Covey.Town.</td>
    <td>App</td>
  </tr>
  <tr><td>UserCreation</td></tr>
  <tr><td>TownLink</td></tr>
  <tr><td>UserLinkJoin</td></tr>
  <tr><td>TownInvitation</td></tr>
</table>
