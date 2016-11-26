//
//  Store.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//


import UIKit
import CoreLocation
import EVReflection
import Parse

class Store: EVObject {
    /**
     Returns the current store selected by the current user.
     
     - Author: Luis Perez
     
     - todo: Improve the implementation.
     */
    class var currentStore: Store? {
        get {
            return User.currentUser?.current.store
        }
    }
    
    /** The unique id of the Store in our Parse databse */
    var id: String?
    /** The store name */
    var name: String!
    /** The location of the store, in (lat, long) format. `nil` implies the location is undetermined */
    var location: CLLocation?
    /** When the self.location is not nil, this returns a pretty-print format of the location, typically as `City, State` */
    var locationAsString: String? {
        return "Mountain View"
    }
    /** A short description of the store. `nil` when the description is unavailable */
    var overview: String?
    /** The URL for the image to be used for the store */
    var image: URL?
    
    /** 
     Initializer the Store object specified by `id`.
     - Author: 
        Luis Perez
     
     - parameters:
        - id: The `id` for the store, in `String` format.
    */
    init(id: String) {
        super.init()
        name = "Walmart"
        overview = "This is walmart, a lowprice retailer"
        image = URL(string: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSWYZIj9Q4-Bamxzyb6W_c3k3zQ2BtNg7uADgbxB90WhoTO9fWT_KAzs_Ja")
        
    }
    required init() {
        name  = ""
    }
    
    /**
     Need to override since EVObject has issues with optionals.
     
     - Author:
        Luis Perez
    */
    override func propertyConverters() -> [(String?, ((Any?) -> ())?, (() -> Any?)?)] {
        return [
            ("image", {
                if let url = $0 as? String {
                    self.image = URL(string: url)
                }
            }, {
                return self.image?.absoluteString ?? ""
            })
        ]
    }
    
    /**
     Sets the provided `view` to contain the store image as determined by `self.image`.
     
     - Author: Luis Perez
     
     - parameters:
        - view: The `UIImageView` to set.
    */
    func setStoreImage(view: UIImageView) -> Void {
        guard let imageURL = image else { return }
        Utilities.updateImageView(view, withAsset: URLRequest(url: imageURL), withPreview: nil, withPlaceholder: nil)
    }
    
    /**
     Saves the current `Store` to our Parse Database.
     
     - Author:
        Jose Villanueva 
     */
    func parseSave(){
        let store = PFObject(className: "Store")
        store["name"] = self.name
        store["location"] = self.location
        store["locationAsString"] = self.locationAsString
        store["imageUrl"] = self.image
        
        store.saveInBackground { (succeeded:Bool, error:Error?) in
            if(succeeded){
                self.id = store.objectId
                print("saved with id: \(store.objectId)")
            } else {
                print(error?.localizedDescription ?? "default: error saving \(self.name) store to parse")
            }
        }
    }
}
