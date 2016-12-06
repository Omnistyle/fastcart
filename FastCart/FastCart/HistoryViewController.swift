//
//  HistoryViewController.swift
//  FastCart
//
//  Created by Luis Perez on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class HistoryViewController: UIViewController, UITableViewDelegate, UITableViewDataSource {
    
    var currentReceipt : Receipt!

    var receipts = [Receipt]() {
        didSet {
            tableView.reloadData()
        }
    }
    @IBOutlet weak var tableView: UITableView!
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
        tableView.dataSource = self
        tableView.delegate = self
        
        // set receipts
        if let history = User.currentUser?.history
        {
            receipts = history
        }
        
        if let user = User.currentUser {
             Receipt.getReceipts(userId: user.id, completion: { ( recps: [Receipt]) in
                self.receipts = recps
            })
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return receipts.count
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "ReceiptCell") as! ReceiptCell
        cell.receipt = receipts[indexPath.row]
        return cell
        
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        print(indexPath.row)
        
        self.currentReceipt = receipts[indexPath.row]
        print("navigating to receipt history items")

        
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let controller = storyboard.instantiateViewController(withIdentifier: "ReceiptHistoryViewController") as! ReceiptHistoryViewController
        controller.receiptId = self.currentReceipt.id!
        controller.receiept = receipts[indexPath.row] as Receipt
        let navigationController = UINavigationController(rootViewController: controller)
        
        self.present(navigationController, animated: true, completion: nil)
        
    }

    
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        
        if (segue.identifier == "historyreceiptSegue"){
            let navigationViewController = segue.destination as! UINavigationController
            let receipthistoryViewController = navigationViewController.topViewController as! ReceiptHistoryViewController
            
            receipthistoryViewController.receiptId = self.currentReceipt.id!
            
        }
        
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
 

}
