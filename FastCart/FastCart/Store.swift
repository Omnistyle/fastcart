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

extension CLLocation : EVReflectable {}

class Store: EVObject {
    /**
     Returns the current store selected by the current user.
     
     - Author: Luis Perez
     
     - todo: Improve the implementation.
     */
    private static var _currentStore: Store?
    class var currentStore: Store {
        get {
            if self._currentStore == nil {
                _currentStore = Store(id: "dummy")
            }
            return self._currentStore!
        }
        set(store) {
            self._currentStore = store
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
        self.parseSave(completion: {(s: Store) in })
        
    }
    required init() {
        super.init()
    }
    
    /** Mark -- EVObject overrides **/
    override func propertyConverters() -> [(String?, ((Any?) -> ())?, (() -> Any?)?)] {
        return [
            ("image", { self.image = URL.fromJson(json: $0 as? String) }, { return self.image?.toJson() ?? "nil" }),
            ("addToCartUrl", { self.image = URL.fromJson(json: $0 as? String) }, { return self.image?.toJson() ?? "nil" })
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
    func parseSave(completion: @escaping (Store) -> Void){
        let store = PFObject(className: "Store")
        store["name"] = self.name
        // TODO (need to change this)
        // store["location"] = self.location ?? "Stuff"
        // store["imageUrl"] = self.image?.absoluteString
        
        store.saveInBackground { (succeeded:Bool, error:Error?) in
            if(succeeded){
                self.id = store.objectId
                print("saved with id: \(store.objectId)")
                completion(self)
            } else {
                print(error?.localizedDescription ?? "default: error saving \(self.name) store to parse")
            }
        }
    }
}
