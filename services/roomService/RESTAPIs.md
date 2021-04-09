# USER INVITATION

### creat user:

_POST_ **/user**

```
body: {username: string}
return: {username: string, userID: string, userToken: string}
```

### list users:

_GET_ **/user**

```
return: {users: {username: string, userID: string}[]}
```

### get invitation id of a town

_GET_ **/invitation/:townID**

```
return: {invitationID: string}
```

### invite a user in system

_POST_ **/invitation**

```
body: {
    conveyTownID: string,
    invitedUserID: string
}
return {invitationSent: boolean}
```

### join using url

_GET_ **/joinInvitation/:invitationID**

```
return: {
    conveyTownID: string,
    friendlyName: string
}
```

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
