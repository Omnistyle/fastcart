//
//  Store.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//


import UIKit

typealias GPS = (lat: Double, long: Double)

class Store: NSObject {
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
}
