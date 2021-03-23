# USER INVITATION

### creat user:

_POST_ **/user**

```
body: {username: string}
return: {username: string, userID: string}
```

### list users:

_GET_ **/user**

```
return: {userlist: {username: string, userID: string}[]}
```

### invite link

_GET_ **/invitation/:townID**

```
return: {invitationID: string}
```

### invite a user

_POST_ **/invitation**

```
body: {
    conveyTownID: string,
    invitedUserID: string
}
return {?}
```

### join using url

_GET_ **/joinInvitation/:invitationID**

```
return: {
    conveyTownID: string,
    friendlyName: string
}
```
