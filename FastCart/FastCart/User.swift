//
//  User.swift
//  FastCart
//
//  Created by Luis Perez on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import Parse
import EVReflection

class User: EVObject {
    /** Notification to be triggered when the user logs out */
    static let userDidLogoutNotification: Notification.Name = Notification.Name(rawValue: "UserDidLogout")
    
    private static var _currentUser: User?
    /** 
     Retrieve the currently logged in user.
     
     - Author:
        Jose Villanueva
     */
    class var currentUser: User? {
        get {
            if self._currentUser == nil {
                _currentUser = Utilities.load(fromKey: Persistece.user.rawValue, into: User.self) as? User
            }
            return self._currentUser
        }
        
        set(user) {
            self._currentUser = user
            Utilities.persist(user, withKey: Persistece.user.rawValue)
        }
    }
    
    /** 
     Fetches the corresponding `user` from the Parse database.
     - author:
        Jose Villanueva
     
     - parameters:
        - email: The email for the User to be fetched.
        - completion: Called when the user is successfully fetched. The user is given as input to the function.
     */
    static func getParseUser(email: String, completion: @escaping (_ result: User) -> Void ) {
        let query = PFQuery(className: "AppUsers")
        query.whereKey("email", equalTo: email)
        
        _ = query.findObjectsInBackground{
            (users: [PFObject]?, error: Error?) -> Void in
            if error == nil {
                if users != nil{
                    let rawUser = users?[0]
                    let userDic = User.getUserDictionary(user: rawUser!)
                    let storedUser = User(dictionary: userDic)
                    
                    completion(storedUser)
                }
                
            } else {
                print("some went wrong")
            }
        }
    }
    
    /**
     Extracts required user information from a `PFObject`.
     
     - author:
        Jose Villanueva
     
     - parameters:
        - user: The `PFObject` returned from a successful Parse request.
     - returns:
        An `NSDictionary` containing relevant User information extracted from Parse.
     */
    static func getUserDictionary(user: PFObject) -> NSDictionary {
        let userDictionary : NSDictionary = [
            "id": user.objectId ?? "0123456789",
            "username" : user["username"] as? String ?? "def username",
            "email" : user["email"] as? String ?? "defaul@email",
            "facebookId" : user["facebookId"] as? String ?? "0123456789",
            ]
        
        return userDictionary
    }
    
    /** Unique id for each user, as saved in Parse */
    var id: String!
    /** Client token storage for interactions with payment. Should check here
     before making a call to the client for a new token. */
    var braintreeToken: String?
    /** The username to be used for the user */
    var username: String!
    /** The email associated with this user */
    var email: String!
    /** The facebook id as returned by the Facebook API */
    var facebookId: String!
    
    var loginMethod: String!
    /** Lists the receipts. Currently only maintains the last 20 */
    var facebookProfilePictureUrlString: String! = "default"
    var history: [Receipt] = []
    /** The current list of items the user is shopping for */
    var current = Receipt() {
        didSet {
            // Assume user takes ownership of any newly set Receipt.
            didSetNewCurrent()
        }
    }
    /** The user's favorite stores */
    var favoriteStores: [Store] = [] {
        didSet {
            Utilities.persist(self, withKey: Persistece.user.rawValue)
        }
    }
    /** TEMP! - Favorite products... lolol */
    var favoriteProducts: [Product] = [] {
        didSet {
            Utilities.persist(self, withKey: Persistece.user.rawValue)
        }
    }
    
    /**
     Used exclusively by Parse.
     
     - Author:
        Jose
    */
    init(dictionary: NSDictionary){
        super.init()
        id = dictionary["id"] as? String
        username = dictionary["username"] as? String
        email = dictionary["email"] as? String
        facebookId = dictionary["facebookId"] as? String
        if let id = facebookId {
            facebookProfilePictureUrlString = "http://graph.facebook.com/\(id)/picture?type=large"
        }
        // Load current from local storage if possible.
        if let local = Utilities.load(fromKey: Persistece.receipt.rawValue, into: Receipt.self) as? Receipt {
            current = local
        }
        // Create a fresh instance, give ownership to User.
        else {
            current = Receipt()
            // Needs to be called because property observers aren't active during initialization.
            didSetNewCurrent()
        }
    }
    required init() {
        super.init()
        
        id = ""
        username = ""
        email = ""
        facebookId = ""
        facebookProfilePictureUrlString = ""
        loginMethod = ""
        // Load current from stored.
        if let local = Utilities.load(fromKey: Persistece.receipt.rawValue, into: Receipt.self) as? Receipt {
            current = local
        }
        else {
            current = Receipt()
            didSetNewCurrent()
        }
    }
    /** MARK: Override */
    override func skipPropertyValue(_ value: Any, key: String) -> Bool {
        // Skip current, as this is set seperately when the class is initialized.
        switch key {
        // We don't want to persist a client token.
        case "braintreeToken":
            return true
        case "current":
            return true
        default:
            return super.skipPropertyValue(value, key: key)
        }
    }
    
    /** Complete the user checkout process by saving all our data to Parse */
    open func completeCheckout() -> Void {
        self.history.insert(self.current, at: 0)
        self.current.parseSave()
        
        // Reset to a new receipt.
        self.current = Receipt()
        self.persistCurrent()
        
        // Persist the user and the receipt so we keep the history around.
        Utilities.persist(self, withKey: Persistece.user.rawValue)
    }
    /**
     Persists the current user receipt only. Used to avoid persisting the entire user on a new product addition.
     Note that we need to clear this key once the user logs out so the next user does not see the products this
     user added to their cart.
     
     - author:
        Luis Perez
     
     - todo:
        Clear persistence.
     */
    func persistCurrent() -> Void {
        Utilities.persist(self.current, withKey: Persistece.receipt.rawValue)
    }

    /**
     Saves the current `Receipt` to Parse.
     
     - author:
        Jose Villanueva
     */
    func parseSave(){
        let user = PFObject(className: "AppUsers")
        user["unsername"] = self.username!
        user["email"] = self.email!
        user["facebookId"] = self.facebookId!
        user["facebookProfilePictureUrl"] = self.facebookProfilePictureUrlString!
        user.saveInBackground { (succeeded:Bool, error:Error?) in
            if(succeeded){
                if let id = user.objectId {
                    self.id = id
                    print("saved with id: \(id)")
                } else {
                    print("default: error retrieving id from saved object \(self.username)")
                }
            } else {
                print(error?.localizedDescription ?? "default: error saving user to parse")
            }
        }
    }
    
    /** Fetches a new client token from the Braintree server. Sets the results. Sets User.clientToken to the given value unless a completion is given. In the latter case, calls the completion with the token rather than saving it in the user.
     */
    func fetchClientToken(completion: ((String?) -> Void)?) {
        let clientTokenURL = URL(string: "\(Constants.paymentServerURL)/client_token/\(self.id!)")!
        var clientTokenRequest = URLRequest(url: clientTokenURL)
        clientTokenRequest.setValue("text/plain", forHTTPHeaderField: "Accept")
        URLSession.shared.dataTask(with: clientTokenRequest, completionHandler: {[unowned self] (data, response, error) -> Void in
            guard let data = data else {
                completion?(nil)
                return
            }
            guard let clientToken = String(data: data, encoding: String.Encoding.utf8) else {
                completion?(nil)
                return
            }
            self.braintreeToken = clientToken
            if let code = completion {
                return code(clientToken)
            }
            self.braintreeToken = clientToken
        }).resume()
    }
    
    /**
     Called after a new receipt is set as the current for the user. Takes care of initializing the receipt appropriately.
     
     - author:
        Luis Perez
     */
    private func didSetNewCurrent() {
        current.userId = id
        current.started = Date()
        persistCurrent()
    }
}
