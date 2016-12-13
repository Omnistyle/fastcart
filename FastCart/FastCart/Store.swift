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
    
    /**
     TODO
     */
    class func stores(from dictionaries: [NSDictionary]) -> [Store] {
        return []
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
    /** If the current user favorites this store */
    var favorite: Bool = false
    /** Used for test stores to set their image... */
    var _image: UIImage?
    
    /** 
     Initializer the Store object specified by `id`.
     - Author: 
        Luis Perez
     
     - parameters:
        - id: The `id` for the store, in `String` format.
    */
    init(id: String, name: String, overview: String, image: String) {
        super.init()
        self.id = id
        self.overview = overview
        self.name = name
        self.image = URL(string: image)
    }
    init(id: String) {
        super.init()
        name = "Walmart"
        overview = "This is walmart, a lowprice retailer"
        image = URL(string: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSWYZIj9Q4-Bamxzyb6W_c3k3zQ2BtNg7uADgbxB90WhoTO9fWT_KAzs_Ja")
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
    override func skipPropertyValue(_ value: Any, key: String) -> Bool {
        switch key {
        case "_image":
            return true
        default:
            return false
        }
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
        store["name"] = self.name!
        if let location = self.location {
            store["location"] = location
        }
        if let imageUrl = self.image?.absoluteString {
            store["imageUrl"] = imageUrl
        }
        
        store.saveInBackground { (succeeded:Bool, error:Error?) in
            if(succeeded){
                if let id = store.objectId {
                    self.id = id
                    print("saved with id: \(id)")
                } else {
                    print("default: error retrieving id from saved object \(self.name)")
                }
            } else {
                print(error?.localizedDescription ?? "default: error saving \(self.name) store to parse")
            }
            completion(self)
        }
    }
}
