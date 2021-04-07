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
