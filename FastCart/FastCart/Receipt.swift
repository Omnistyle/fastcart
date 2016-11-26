//
//  Receipt.swift
//  FastCart
//
//  Created by Luis Perez on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import EVReflection
import Parse

class Receipt: EVObject {
    /** List of products purchased with this receipt. *//
    var products: [Product] = [] {
        didSet {
            self.subTotal = products.reduce(0, { (acc, cur) in acc + (cur.salePrice ?? 0) })
        }
    }
    /** The time at which the first product was added to the receipt. If nil, the receipt has no products. */
    var started: Date?
    /** The data as a string **/
    var startedAsString: String? {
        return started?.description
    }
    
    // The timestamp when the user submitted the payment information for this receipt.
    // If nil, the receipt has not been paid for.
    var completed: Date?
    
    var total: Double = 0.0
    var totalAsString: String {
        return Utilities.moneyToString(amount: self.total)
    }
    
    var id: String?
    
    // Associate with a store.
    var storeId: String?
    
    var store: Store?
    
    //Associate with an User
    var userId: String?

    // The amount of tax charged for this receipt.
    var tax: Double = 0.0 {
        didSet {
            self.total = self.tax + self.subTotal
        }
    }
    var taxAsString: String {
        return Utilities.moneyToString(amount: self.tax)
    }
    
    // The subtotal on the receipt.
    var subTotal: Double = 0.0 {
        didSet {
            // update tax
            let taxPct = 0.08
            self.tax = taxPct * self.subTotal
        }
    }
    
    var subTotalAsString: String {
        return Utilities.moneyToString(amount: self.subTotal)
    }
    
    
    // Whether or not the receipt has been paid for.
    var paid: Bool = false
    
    
    override init() {
    }
    
    func parseSave(){
        let receipt = PFObject(className: "Receipt")
        receipt["userId"] = self.userId
        receipt["storeId"] = self.storeId
        receipt["started"] = self.started
        receipt["completed"] = self.completed
        receipt["total"] = self.total
        receipt["subtotal"] = self.subTotal
        receipt["tax"] = self.tax
        receipt["paid"] = self.paid
        
        receipt.saveInBackground { (succeeded:Bool, error:Error?) in
            if(succeeded){
                self.id = receipt.objectId
                print("saved with id: \(receipt.objectId)")
                
                for product in self.products { //save all products in receipt
                    product.receiptId = self.id
                    product.parseSave()
                }
                
            } else {
                print(error?.localizedDescription ?? "default: error saving reciept to parse")
            }
        }
    }
}
