# Design of Covey.Town project

## Introduction

## CRC cards

### ActiveUser

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

### CoveyInvitationListner

<table>
      <tr>
         <td colspan='2'><b>Class Name: (interface) CoveyInvitationListner</b></td>
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
