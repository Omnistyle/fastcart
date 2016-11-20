//
//  User.swift
//  FastCart
//
//  Created by Luis Perez on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class User: NSObject {
    // Necessary unique id for each user of our application.
    var id: Int = 0
    
    // List of receipts (only keep the last 20)
    var history: [Receipt] = []
    
    // The current list of items the user is shopping.
    var current = Receipt()
    
    // The favorite stores.
    var favoriteStores: [Store] = []
    
    override init() {
        id = 0
        history = []
        favoriteStores = []
    }
    
    
    private static var _currentUser: User?

    class var currentUser: User? {
        get {
            let defaults = UserDefaults.standard
            if self._currentUser == nil {
                // TODO: Load the user model
                self._currentUser = User()
            }
            return self._currentUser
        }
        
        set(user) {
            self._currentUser = user
            let defaults = UserDefaults.standard
            if let user = user {
                // TODO: Store the current user.
                
            }
            else {
                // TODO: Clear out the current user from storage
            }
            defaults.synchronize()
        }
    }

}
