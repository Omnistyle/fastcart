//
//  User.swift
//  FastCart
//
//  Created by Luis Perez on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import Parse

class User: NSObject {
    
    var username: String?
    
    var email: String?
    
    var facebookId: String?
    
    var facebookProfilePictureUrlString: String! = "default"
    
    // Necessary unique id for each user of our application.
    var id: String = "1234"
    
    // List of receipts (only keep the last 20)
    var history: [Receipt] = []
    
    // The current list of items the user is shopping.
    var current = Receipt()
    
    // The favorite stores.
    var favoriteStores: [Store] = []
    
    var dictionary: NSDictionary?
    
    init(dictionary: NSDictionary){
        
        self.dictionary = dictionary
        username = dictionary["username"] as? String
        email = dictionary["email"] as? String
        facebookId = dictionary["facebookId"] as? String
        facebookProfilePictureUrlString = "http://graph.facebook.com/\(facebookId)/picture?type=large"
    }
    
    static let userDidLogoutNotification = "UserDidLogout"
    
    private static var _currentUser: User?

    class var currentUser: User? {
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
                let data = try! JSONSerialization.data(withJSONObject: user.dictionary!, options:[])
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
        let userDictionary : NSDictionary? = [
            "unsername" : user["unsername"] as? String ?? "def username",
            "email" : user["email"] as? String ?? "defaul@email",
            "facebookId" : user["facebookId"] as? String ?? "0123456789",
            ]
        
        return userDictionary!
    }

    func parseSave(){
        let user = PFObject(className: "AppUsers")
        user["unsername"] = self.username
        user["email"] = self.email
        user["facebookId"] = self.facebookId
        user["facebookProfilePictureUrl"] = self.facebookProfilePictureUrlString
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
