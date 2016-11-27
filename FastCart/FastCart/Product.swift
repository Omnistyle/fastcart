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
    /** The short name of the Product */
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
    init(dictionary: NSDictionary, api: apiType) {
        switch api {
        case .walmart:
            upc = dictionary["upc"] as? String
            name = dictionary["name"] as? String
            overview = dictionary["shortDescription"] as? String
            if let imageString = dictionary["largeImage"] as? String{
                self.image = URL(string: imageString)
            }
            //store = Store(id: "Walmart")
            salePrice = dictionary["salePrice"] as? Double
            brandName = dictionary["brandName"] as? String
            averageRating = dictionary["customerRating"] as? String
            color = dictionary["color"] as? String
            category = dictionary["categoryPath"] as? String
            size = dictionary["size"] as? String
            freeShipToStore =  dictionary["freeShipToStore"] as? Bool
        case .upc:
            // often multiple objects in array though
            break
        case .manual:
            name = dictionary["name"] as? String
        }
    }
    required init() {
    }
    
    /** MARK - EVObject */
    /**
     Need to override since EVObject has issues with optionals.
     */
    override func setValue(_ value: Any!, forUndefinedKey key: String) {
        switch key {
        case "freeShipToStore":
            freeShipToStore = value as? Bool
        case "salePrice":
            salePrice = value as? Double
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
            ("addToCartUrl", { self.image = URL.fromJson(json: $0 as? String) }, { return self.image?.toJson() ?? "nil" })
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
