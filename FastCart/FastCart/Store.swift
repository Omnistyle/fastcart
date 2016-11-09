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
    var overview: String?
    var image: URL?
    
    init(id: String) {
        super.init()
        name = "Walmart"
        location = (lat: 0, long: 0)
        overview = "This is walmart, a lowprice retailer"
        image = URL(string: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcSWYZIj9Q4-Bamxzyb6W_c3k3zQ2BtNg7uADgbxB90WhoTO9fWT_KAzs_Ja")
        
    }
    // TODO implement current store
//    class var currentStore: Store {
//        didSet {
//            currentStore = init(id: "Walmart")
//        }
//    }
    
}
