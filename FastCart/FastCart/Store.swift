//
//  Store.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//


import UIKit
import EVReflection

typealias GPS = (lat: Double, long: Double)

class Store: EVObject {
    /** The store name */
    var name: String!
    /** The location of the store, in (lat, long) format. `nil` implies the location is undetermined */
    var location: GPS?
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
     
     - Author: Luis Perez
     
     - parameters:
        - id: The `id` for the store, in `String` format.
    */
    init(id: String) {
        super.init()
        name = "Walmart"
        location = (lat: 0, long: 0)
        overview = "This is walmart, a lowprice retailer"
        image = URL(string: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSWYZIj9Q4-Bamxzyb6W_c3k3zQ2BtNg7uADgbxB90WhoTO9fWT_KAzs_Ja")
        
    }
    
    required init() {
        fatalError("init() has not been implemented")
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
     Saves the object to Parse.
     
     - Author: Jose
    */
    func parseSave(){
        print(self)
    }
    
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
    
}
