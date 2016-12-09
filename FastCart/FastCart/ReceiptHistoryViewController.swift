//
//  ReceiptHistoryViewController.swift
//  FastCart
//
//  Created by Jose Villanuva on 12/4/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class ReceiptHistoryViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {

    var receiptId: String = ""
    var receiept: Receipt!
    var store: Store!
    var products: [Product] = []
    
    @IBOutlet weak var receiptTable: UITableView!
    
    @IBOutlet weak var storeNameLabel: UILabel!
    
    @IBOutlet weak var storeLocationLabel: UILabel!
    
    @IBOutlet weak var subtotalLabel: UILabel!
    
    @IBOutlet weak var taxLabel: UILabel!
    
    @IBOutlet weak var totalLabel: UILabel!
    
    @IBOutlet weak var timestampLabel: UILabel!
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        print("printing recepit id: " + receiptId )
        
        self.receiptTable.dataSource = self
        self.receiptTable.delegate = self
        self.receiptTable.rowHeight = UITableViewAutomaticDimension
        self.receiptTable.estimatedRowHeight = 120
        self.receiptTable.separatorStyle = .none
        self.automaticallyAdjustsScrollViewInsets = false
        
        getStore()
        getProducts()
        getReceiptDetails()
        // Do any additional setup after loading the view.
    }

    func getStore(){
        let store = Store.currentStore
        storeNameLabel.text = store.name
        storeLocationLabel.text = store.locationAsString
    }
    
    func getProducts(){
        Product.getProducts(receiptId: receiptId, completion: {(products:[Product]) in
            self.products = products
            self.receiptTable.reloadData()
        })
    }
    
    func getReceiptDetails(){
        if let currentReceipt = receiept {
            
            subtotalLabel.text = currentReceipt.subTotalAsString
            taxLabel.text = currentReceipt.taxAsString
            totalLabel.text = currentReceipt.totalAsString
            if let date = currentReceipt.completed {
                timestampLabel.text = String(describing: date)
            }
        }
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int
    {
        return self.products.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "HistoryProductCell", for: indexPath) as! HistoryProductCell
        
        cell.product = products[indexPath.row]
        return cell
    }
    
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func onBackToHistory(_ sender: Any) {
        self.dismiss(animated: true, completion: {
        })
    }

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
