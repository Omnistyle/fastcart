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
    static let userDidLogoutNotification = "UserDidLogout"
    
    private static var _currentUser: User?
    /** Retrieve the currently logged in user 
     
     Author:
        Jose Villanueva
     */
    class var currentUser: User! {
        get {
            if self._currentUser == nil {
                let defaults = UserDefaults.standard
                let userData = defaults.object(forKey: "currentUserData") as? NSData
                
                if let userData = userData {
                    let dictionary = try! JSONSerialization.jsonObject(with: userData as Data, options: []) as! NSDictionary
                    _currentUser = User(dictionary: dictionary)
                }
            }
            return self._currentUser
        }
        
        set(user) {
            self._currentUser = user
            let defaults = UserDefaults.standard
            if let user = user {
                let data = try! JSONSerialization.data(withJSONObject: user.dictionary, options:[])
                defaults.set(data, forKey: "currentUserData")
            }
            else {
                defaults.set(nil, forKey: "currentUserData")
            }
            
            defaults.synchronize()
        }
    }
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
    
    static func getUserDictionary(user: PFObject) -> NSDictionary {
        let userDictionary : NSDictionary = [
            "id": user.objectId ?? "0123456789",
            "unsername" : user["unsername"] as? String ?? "def username",
            "email" : user["email"] as? String ?? "defaul@email",
            "facebookId" : user["facebookId"] as? String ?? "0123456789",
            ]
        
        return userDictionary
    }
    
    /** Unique id for each user, as saved in Parse */
    var id: String!
    /** The username to be used for the user */
    var username: String!
    /** The email associated with this user */
    var email: String!
    /** The facebook id as returned by the Facebook API */
    var facebookId: String!
    /** Lists the receipts. Currently only maintains the last 20 */
    var history: [Receipt] = []
    /** The current list of items the user is shopping for */
    var current = Receipt() {
        didSet {
            Utilities.persist(object: self, withKey: Persistece.receipt.rawValue)
        }
    }
    /** The user's favorite stores */
    var favoriteStores: [Store] = []
    /** TODO (remove and add more generalized local persistence using EvReflection */
    var dictionary: NSDictionary!
    
    init(dictionary: NSDictionary){
        self.dictionary = dictionary
        id = dictionary["id"] as? String
        username = dictionary["username"] as? String
        email = dictionary["email"] as? String
        facebookId = dictionary["facebookId"] as? String
        
        // Load current from local storage.
        current = Utilities.load(fromKey: Persistece.receipt.rawValue, into: Receipt.self) as? Receipt ?? Receipt()
    }
    required init() {
        id = ""
        username = ""
        email = ""
        facebookId = ""
        dictionary = NSDictionary()
    }
    
    /** Complete the user checkout process by saving all our data to Parse */
    func completeCheckout() -> Void {
        self.history.insert(self.current, at: 0)
        self.current.parseSave()
        
        // Reset to a new receipt.
        self.current = Receipt()
    }

    /**
     Persists the current user receipt.
     */
    func persistCurrent() -> Void {
        Utilities.persist(object: self.current, withKey: Persistece.receipt.rawValue)
    }

    func parseSave(){
        let user = PFObject(className: "AppUsers")
        user["unsername"] = self.username
        user["email"] = self.email
        user["facebookId"] = self.facebookId
        user.saveInBackground { (succeeded:Bool, error:Error?) in
            if(succeeded){
                self.id = user.objectId!
                print("saved with id: \(user.objectId)")
            } else {
                print(error?.localizedDescription ?? "default: error saving user to parse")
            }
        }
    }
    
}
