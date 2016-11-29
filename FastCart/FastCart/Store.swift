//
//  Store.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//


import UIKit
import Parse

typealias GPS = (lat: Double, long: Double)

class Store: NSObject {
    var id: String?
    var name: String?
    var location: GPS?
    var locationAsString: String? {
        return "Mountain View"
    }
    var overview: String?
    var image: URL?
    
    init(id: String) {
        super.init()
        name = "Walmart"
        location = (lat: 0, long: 0)
        overview = "This is walmart, a lowprice retailer"
        image = URL(string: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSWYZIj9Q4-Bamxzyb6W_c3k3zQ2BtNg7uADgbxB90WhoTO9fWT_KAzs_Ja")
        
    }
    
    func setStoreImage(view: UIImageView) -> Void {
        guard let imageURL = image else { return }
        Utilities.updateImageView(view, withAsset: URLRequest(url: imageURL), withPreview: nil, withPlaceholder: nil)
    }
    // TODO(luis): Improve this implementation. Do not allow set.
    class var currentStore: Store? {
        get {
            return User.currentUser?.current.store
        }
    }
    
    func parseSave(){
        let store = PFObject(className: "Store")
        store["name"] = self.name
        //store["location"] = self.location
        store["locationAsString"] = self.locationAsString
        //store["imageUrl"] = self.image
        
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
