const { Router } = require('express')
const router = Router()
const Users = require('../Configuration/Models/UsersSchema')

router.get('/getUsers/:userId', async (req, res) => {
    //Display all users excluding the user himself/herself and also all friend requested users because they are displayed differently
    const { userId } = req.params
    try {
        //Idea: fetch all the userIds in the logged in user(currentUser) and store them in an array
        //after that I add the current user's Id (logged in user) to the array too because i dont want to display them all to the logged in user
        //Now i search through the entire Users array and find all users whose id does not match any of the Ids in the excluded ID list/ array

        const loggedInUser = await Users.findById(userId)
        //Excluding all friendRequests, friends and the user from displaying 
        const excludedUsers = [
            userId,
            ...loggedInUser.friendRequests.map(req => req.senderId),
            ...loggedInUser.friends.map(friend => friend.userId)
        ]

        //Fetching all users excluding the excludedUsers
        const friendsEligibleForAddition = await Users.find({ _id: { $nin: excludedUsers }})
       
        res.json({success: true, users: friendsEligibleForAddition})

    } catch(err) {
        console.log(err)
        res.json({success: false, error: err})
    }
})

//Friend Request
router.post('/send-friend-request', async (req, res) => {
    const { userId, receiverId } = req.body
    try {
        const sender = await Users.findById(userId)
        const receiver = await Users.findById(receiverId)

        //Check if the receiver has an id found in their friendRequests object thats equal to the one sending. if so the request has already being sent
        //Just compare the userId  in the friendRequest with the sender's id (userId)
        //***Note: You dont receive any objectwhen you send a request but the receiver does, so everything is done in the recever's friendReq object
        if(receiver.friendRequests.some((req) => req.senderId === userId)) return res.json({success: false, error: 'Request has being sent already'})
        if(receiver.friends.some((friend) => friend.userId === userId)) return res.json({success: false, error: 'Already friends'})

        receiver.friendRequests.push({
            senderId: userId,
            senderPhoto: sender.profileImage,
            username: sender.username
        })

        await receiver.save()

        res.json({success: true, message: 'Friend request sent'})
    } catch(err) {
        console.log(err)
        res.json({success: false, error: err})
    }
})

router.get('/fetchRequests/:userId', async (req, res) => {
    const {userId} = req.params
    try {
        const findUser = await Users.findById(userId)
        if(!findUser) return res.json({scess: false, error: 'User not found'})
 
        res.json({success: true, requests: findUser.friendRequests})

    } catch(err) {
        console.log(err)
    }
})

router.post('/accept-friend-request', async (req, res) => {
    const { userId, friendsId} = req.body

    try {
        const user = await Users.findById(userId)
        const friend = await Users.findById(friendsId)

        user.friendRequests = user.friendRequests.filter(req => req.senderId !== friendsId)
        
        user.friends.push({
            userId: friend._id,
            username: friend.username,
            profileImage: friend.profileImage     
        })
        friend.friends.push({
            userId: user._id,
            username: user.username,
            profileImage: user.profileImage 
        })

        //save the changes to the database
        user.save()
        friend.save()

        res.json({success: true})
    } catch(err) {
        console.log(err)
        res.json({success: false, error: err})
    }
})
router.post('/decline-friend-request', async (req, res) => {
    const {userId, reqId} = req.body
    console.log('reqId::: ', reqId)

    try {
        //check Users existence
        const user = await Users.findById(userId)
        if(!user) return res.json({success: false, error: 'An error occured, user not found'}) 
        user.friendRequests = user.friendRequests.filter(req => req.senderId !== reqId)
        user.save()

        res.json({success: true, message: 'Request declined'})

    } catch(err) {
        res.json({success: false, error: err})
    }
})
router.post('/deleteRequest', async (req, res) => {
    const { userId, receiverId} = req.body
    try {
        const user = await Users.findById(userId)
        const receiver = await Users.findById(receiverId)

        if(!user) return res.json({success: false, error: 'User not found'})
        if(!receiver) return res.json({success: false, error: 'Not found'})
        

        receiver.friendRequests = receiver.friendRequests.filter(req => req.senderId !== userId)
        receiver.save() 

        return res.json({success: true, message: 'Request removed'})
        

    } catch(err) {
        return res.json({success: false, error: err})
    }
})

router.get('/fetchFriends/:userId', async (req, res) => {
    const { userId } = req.params
    try {
        const user = await Users.findById(userId)
        if(!user) return res.json({success: false, error: 'User not found, please log in'})
        
        res.json({success: true, friends: user.friends})
    } catch (err) {
        res.json({success: false, error: err})
    }
})

module.exports = router
