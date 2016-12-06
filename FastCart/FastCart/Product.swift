//
//  Product.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/7/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import AFNetworking
import EVReflection
import Parse

enum apiType {
    case walmart
    case upc
    case manual
}

class Product: EVObject {
    /**
     Converts responses from the `api` to an array of products.
     
     - Author:
     Belinda Zeng
     
     - parameters:
     - dictionaries: An array of responses from the api. Each response should map to a `Product`
     - api: The api from which the responses should be parsed.
     
     - returns:
     An array of Products.
     */
    class func productsWithArray(dictionaries: [NSDictionary], api: apiType) -> [Product]{
        var products = [Product]()
        for dictionary in dictionaries {
            let product =
                Product.init(dictionary: dictionary, api: api)
            products.append(product)
        }
        return products
    }
    
    /** The unique product id based on Parse **/
    var id : String?
    /** The unique receipt id from Parse to which this product belongs */
    var receiptId : String?
    /** The UPC-13 code for Product */
    var upc: String?
    var idFromStore: String?
    var name: String?
    /** A short descriptive overview of the Product */
    var overview: String?
    /** The URL for the image for the Product */
    var image: URL?
    /** The store from which the Product information is pulled */
    // var store: Store?
    /** The current sale price of this specific product */
    var salePrice: Double?
    var salePriceAsString: String {
        if let price = salePrice {
            return Utilities.moneyToString(price)
        }
        return ""
    }
    /** The brand name of the Product */
    var brandName: String?
    /** The average rating given to this Product across marketplaces */
    var averageRating: String?
    /** Rating image */
    var ratingImage: URL?
    /** The color (if necessary) for the Product */
    var color: String?
    /** The size (if available) of the Product */
    var size: String?
    /** A list of similar product recommeded by other users */
    var recommended: [Product]?
    /** If true, the Product if free to ship to store */
    var freeShipToStore: Bool?
    /** The url for adding this product to the customers cart from the respective Store */
    var addToCartUrl: URL?
    /** A string description of the category this Product belongs to */
    var category: String?
    var variants: [String]?
    var clearance: Bool?
    var specialBuy: Bool?
    var originalPrice: Double?
    var variantImages = [NSURL]()
        
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
    
    /**
     Initialize `User` from a dictionary object.
     
     - author:
        Belinda Zeng
        Jose Villanueva 
     
     - parameters: 
        - dictionary: The input dictionary.
        - api: The API from which the dictionary was retrieved.
     - returns: 
        A `User` with the fields set from `dictionary`
     */
    func getVariantImages(ids: [String]) {
        let intArray = ids.map({(id: String) -> Int in
            return Int(id) ?? 0})
        let max = intArray.max()
        _ = intArray.min()
        if let max = max {
        let use = String(describing: max)
        
            WalmartClient.sharedInstance.getVariantImage(id: use, success: {(image: URL) -> () in
                self.variantImages.append(image as NSURL)
                
            }, failure: {(error: Error) -> () in
                print(error)
            }
            )
        }
    }
    
//        let shortenedIds = ids.suffix(2)
//        for id in shortenedIds {
//            let when = DispatchTime.now() + 2 // change 2 to desired number of seconds
//            DispatchQueue.main.asyncAfter(deadline: when) {
//                // Your code with delay
//                WalmartClient.sharedInstance.getVariantImage(id: id, success: {(image: URL) -> () in
//                        self.variantImages.append(image)
//                        
//                    }, failure: {(error: Error) -> () in
//                        print(error)
//                    }
//                    )
//            }
//
//            
//        }
//    }

    init(dictionary: NSDictionary, api: apiType) {

        super.init()
        switch api {
        case .walmart:
            upc = dictionary["upc"] as? String
            name = dictionary["name"] as? String
            overview = dictionary["shortDescription"] as? String
            let x: Int = dictionary["itemId"] as! Int
            let xNSNumber = x as NSNumber
            idFromStore = xNSNumber.stringValue
            if let imageString = dictionary["largeImage"] as? String{
                self.image = URL(string: imageString)
                
            }
            
//            store = Store(id: "Walmart")
            // round to two decimals
            if let salePriceDouble = dictionary["salePrice"] as? Double {
                salePrice = round(salePriceDouble * 100)/100
            }
            
            if let originalPriceDouble = dictionary["msrp"] as? Double {
                originalPrice = round(originalPriceDouble * 100)/100
            }
            if let ratingImageString = dictionary["customerRatingImage"] as? String{
                self.ratingImage = URL(string: ratingImageString)
                
            }
            
            //store = Store(id: "Walmart")
            salePrice = dictionary["salePrice"] as? Double
            
            brandName = dictionary["brandName"] as? String
            averageRating = dictionary["customerRating"] as? String
            color = dictionary["color"] as? String
            category = dictionary["categoryPath"] as? String
            size = dictionary["size"] as? String
            freeShipToStore =  dictionary["freeShipToStore"] as? Bool
            
            
//            if let walmartId = dictionary["itemId"] as? Int {
//                // make call to get variants
//                WalmartClient.sharedInstance.getVariantsByItemId(id: String(walmartId), success: { (variants: [String]) -> () in
//                    self.variants = variants
//                    // now set variant images
//                    self.getVariantImages(ids: variants)
//                }, failure: { (error) -> () in
//                })
//            }
        
        if let imageEntities = dictionary["imageEntities"] as? [NSDictionary] {
            for image in imageEntities {
                if let imageString = image["largeImage"] as? String {
                    print(imageString)
                    if let imageUrl = URL(string: imageString) {
                        print(imageUrl)
                        self.variantImages.append(imageUrl as NSURL)
                    }
                }
            }
        }

//            for image in imageEntities {
//                if let imageString = image["largeImage"] as? String {
//                    if let imageUrl = URL(string: imageString) {
//                    self.variantImages.append(imageUrl)
//                    }
//                }
//            }
            
            
        clearance = dictionary["clearance"] as? Bool
        specialBuy = dictionary["specialBuy"] as? Bool

        case .upc:
            // often multiple objects in array though
            break
        case .manual:
            name = dictionary["name"] as? String
        }
    }
    
    required init() {
        super.init()
    }

    
    /** MARK - EVObject */
    /**
     Need to override since EVObject has issues with optionals.
     */
    override func setValue(_ value: Any!, forUndefinedKey key: String) {
        switch key {
        case "freeShipToStore":
            freeShipToStore = value as? Bool
        case "clearance":
            clearance = value as? Bool
        case "salePrice":
            salePrice = value as? Double
        case "originalPrice":
            originalPrice = value as? Double
        case "ratingImage":
            ratingImage = value as? URL
        case "formatter":
            // Nothing to do, skip.
            break
        default:
            self.addStatusMessage(.IncorrectKey, message: "SetValue for key '\(key)' should be handled.")
            print("---> setValue for key '\(key)' should be handled.")
        }
    }
    override func propertyConverters() -> [(String?, ((Any?) -> ())?, (() -> Any?)?)] {
        return [
            ("image", { self.image = URL.fromJson(json: $0 as? String) }, { return self.image?.toJson() ?? "nil" }),
            ("addToCartUrl", { self.addToCartUrl = URL.fromJson(json: $0 as? String) }, { return self.addToCartUrl?.toJson() ?? "nil" }),
        ]
    }
    
    /**
     Updates an imageview to reflect the product.
     
     - author:
     Luis Perez
     
     - parameters:
        - image: The UIImageView to be updated to reflect this products image.
    */
    func setProductImage(view: UIImageView) -> Void {
        guard let largeImageURL = image else { return }
        Utilities.updateImageView(view, withAsset: URLRequest(url: largeImageURL), withPreview: nil, withPlaceholder: #imageLiteral(resourceName: "noimagefound"))
    }
    
    /** 
     Saves the current `Product` to our Parse Database.
     
     - Author:
        Jose Villanueva 
     */
    func parseSave(){
        let product = PFObject(className: "Product")
        product["receipId"] = self.receiptId!
        if let upc = self.upc {
            product["upc"] = upc
        }
        product["name"] = self.name!
        if let imageUrl = self.image?.absoluteString {
            product["imageUrl"] = imageUrl
        }
        product["salePrice"] = self.salePrice!
        if let brandName = self.brandName {
            product["brandName"] = brandName
        }
        if let averageRating = self.averageRating {
            product["averageRating"] = averageRating
        }
        if let color = self.color {
            product["color"] = color
        }
        if let size = self.size {
            product["size"] = size
        }
        if let freeShipToStore = self.freeShipToStore {
            product["freeShipToStore"] = freeShipToStore

        }
        if let addToCartUrl = self.addToCartUrl{
            product["addToCartUrl"] = addToCartUrl
        }
        if let category = self.category {
            product["category"] = category
        }
        
        product.saveInBackground { (succeeded:Bool, error:Error?) in
            if(succeeded){
                if let id = product.objectId {
                    self.id = id
                    print("saved with id: \(id)")
                } else {
                    print("default: error retrieving id for product \(self.name ?? "") after parse save")
                }
            } else {
                print(error?.localizedDescription ?? "default: error saving \(self.name ?? "") product to parse")
            }
        }
    }
    
    static private func ProductDeserialization(rawProduct : PFObject) -> Product{
        let product = Product()
        product.receiptId = rawProduct["receiptId"] as! String?
        product.upc = rawProduct["upc"] as! String?
        product.name = rawProduct["name"] as! String?
        product.image = rawProduct["imageUrl"] as! URL?
        product.salePrice = rawProduct["salePrice"] as! Double?
        product.brandName = rawProduct["brandName"] as! String?
        product.averageRating = rawProduct["averageRating"] as! String?
        
        product.color = rawProduct["color"] as! String?
        product.size = rawProduct["size"] as! String?
        product.freeShipToStore = rawProduct["freeShipToStore"] as! Bool?
        product.addToCartUrl = rawProduct["addToCartUrl"] as! URL?
        product.addToCartUrl = rawProduct["addToCartUrl"] as! URL?
        return product
    }
    
    static func ProductsDeserialization(rawProducts : [PFObject]) -> [Product]{
        var products = [Product]()
        for rawProduct in rawProducts{
            let product = ProductDeserialization(rawProduct: rawProduct)
            products.append(product)
        }
        
        return products
    }
    
    static func getProducts(receiptId: String, completion: @escaping (_ result: [Product]) -> Void) {
        let query = PFQuery(className: "Product")
        query.whereKey("productId", equalTo: receiptId)
        
        _ = query.findObjectsInBackground{
            (producPFPbjects: [PFObject]?, error: Error?) -> Void in
            if error == nil {
                if producPFPbjects != nil{
                    let products = self.ProductsDeserialization(rawProducts: producPFPbjects!)
                    completion(products)
                }
                
            } else {
                print("some went wrong")
            }
        }
    }
    
}
