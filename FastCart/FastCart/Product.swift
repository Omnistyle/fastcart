//
//  Product.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/7/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import AFNetworking
import Parse

enum apiType {
    case walmart
    case upc
    case manual
}

class Product: NSObject {
    var upc: String?
    var name: String?
    var overview: String?
    var image: URL?
    //var store: Store?
    var salePrice: Double?
    var brandName: String?
    var averageRating: String?
    var color: String?
    var size: String?
    var recommended: [Product]?
    var freeShipToStore: Bool?
    var addToCartUrl: URL?
    var category: String?
    var id : String?
    var receiptId : String?
    
    func formatTimeToString(date: NSDate) -> String {
        let interval = date.timeIntervalSinceNow
        let intervalInt = Int(interval) * -1
        let days = (intervalInt / 3600) / 24
        if days != 0 {
            let daysStr = String(days) + "d"
            return daysStr
        }
        let hours = (intervalInt / 3600)
        if hours != 0 {
            return String(hours) + "h"
        }
        
        let minutes = (intervalInt / 60) % 60
        if minutes != 0 {
            return String(minutes) + "m"
        }
        
        let seconds = intervalInt % 60
        if seconds != 0 {
            return String(seconds) + "s"
        }
        else  {
            return "Now"
        }
    }
    
    init(dictionary: NSDictionary, api: apiType) {
        super.init()
        if api == apiType.walmart {
            upc = dictionary["upc"] as? String
            name = dictionary["name"] as? String
            overview = dictionary["shortDescription"] as? String
            if let imageString = dictionary["largeImage"] as? String{
                self.image = URL(string: imageString)
            }
            //store = Store(id: "Walmart")
            // round to two decimals
            if let salePriceDouble = dictionary["salePrice"] as? Double {
                salePrice = round(salePriceDouble * 100)/100
            }
            brandName = dictionary["brandName"] as? String
            averageRating = dictionary["customerRating"] as? String
            color = dictionary["color"] as? String
            category = dictionary["categoryPath"] as? String
            size = dictionary["size"] as? String
            freeShipToStore =  dictionary["freeShipToStore"] as? Bool
        }
        else if api == apiType.upc {
            // often multiple objects in array though
        }
        else if api == apiType.manual {
            name = dictionary["name"] as? String
        }
    }
    
    /**
     Updates an imageview to reflect the product.
     
     - Author: 
     Luis Perez
     
     - parameters:
        - image: The UIImageView to be updated to reflect this products image.
    */
    func setProductImage(view: UIImageView) -> Void {
        guard let largeImageURL = image else { return }
        Utilities.updateImageView(view, withAsset: URLRequest(url: largeImageURL), withPreview: nil, withPlaceholder: nil)
    }
    
    class func productsWithArray(dictionaries: [NSDictionary], api: apiType) -> [Product]{
        var products = [Product]()
        for dictionary in dictionaries {
            let product =
                Product.init(dictionary: dictionary, api: api)
            products.append(product)
        }
        return products
    }
    
    func parseSave(){
        let product = PFObject(className: "Product")
        product["receipId"] = self.receiptId
        product["upc"] = self.upc
        product["name"] = self.name
        product["imageUrl"] = self.image
        product["salePrice"] = self.salePrice
        product["brandName"] = self.brandName
        product["averageRating"] = self.averageRating
        product["color"] = self.color
        product["size"] = self.size
        product["freeShipToStore"] = self.freeShipToStore
        product["addToCartUrl"] = self.addToCartUrl
        product["category"] = self.category
        
        product.saveInBackground { (succeeded:Bool, error:Error?) in
            if(succeeded){
                self.id = product.objectId
                print("saved with id: \(product.objectId)")
            } else {
                print(error?.localizedDescription ?? "default: error saving \(self.name) product to parse")
            }
        }
    }

}
