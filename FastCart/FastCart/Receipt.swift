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
    /** The unique parse id for this receipt */
    var id: String?
    /** The unique parse store id corresponding to the store associated with this receipt. */
    var storeId: String?
    /** The unique parse id associating this receipt to a user */
    var userId: String?
    /** List of products purchased with this receipt. */
    var products: [Product] = [] {
        didSet {
            self.subTotal = products.reduce(0, { (acc, cur) in acc + (cur.salePrice ?? 0) })
        }
    }
    /** The time at which the first product was added to the receipt. If nil, the receipt has no products. */
    var started: Date?
    var startedAsString: String {
        if let date = started {
            return Utilities.formatTimeToString(date)
        }
        return "N/A"
    }
    /** The timestamp when the user submitted the payment information for this receipt. If nil, the receipt has not been paid for. */
    var completed: Date?
    var completedAsString: String {
        if let date = completed {
            return Utilities.formatTimeToString(date)
        }
        return "N/A"
    }
    /** The total amount for the items in the receipt */
    var total: Double = 0.0
    var totalAsString: String {
        return Utilities.moneyToString(self.total)
    }
    /** The store object associated with this receipt */
    var store: Store!
    /** The amount of tax charged for this receipt. */
    var tax: Double = 0.0 {
        didSet {
            self.total = self.tax + self.subTotal
        }
    }
    var taxAsString: String {
        return Utilities.moneyToString(self.tax)
    }
    /** The subtotal on the receipt. */
    var subTotal: Double = 0.0 {
        didSet {
            // update tax
            let taxPct = 0.08
            self.tax = taxPct * self.subTotal
        }
    }
    var subTotalAsString: String {
        return Utilities.moneyToString(self.subTotal)
    }
    /** Whether or not the receipt has been paid for */
    var paid: Bool = false
    
    required init() {
        store = Store(id: "dummy")
    }
    
    /**
     Saves the Receipt object to Parse. Note that it also saves all of the corresponding Products.
     
     Author:
        Jose Villanueva
     */
    func parseSave(){
        // Save the store. TODO: Save in case of failure?
        if (Store.currentStore.id == nil) {
            store.parseSave(completion: { (store: Store) in
                self.storeId = store.id
                self.parseSaveWithStore()
            })
        } else {
            self.parseSaveWithStore()
        }
    }
    
    private func parseSaveWithStore() {
        let receipt = PFObject(className: "Receipt")
        receipt["userId"] = self.userId!
        receipt["storeId"] = self.storeId!
        receipt["started"] = self.started!
        receipt["completed"] = self.completed ?? Date()
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
