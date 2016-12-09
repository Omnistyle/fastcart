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
    var refreshControl: UIRefreshControl!
    var receipts = [Receipt]() {
        didSet {
            tableView.reloadData()
        }
    }

    private var activityIndicator: UIActivityIndicatorView!
    
    @IBOutlet weak var tableView: UITableView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        //adding refresh table
        refreshControl = UIRefreshControl()
        refreshControl.attributedTitle = NSAttributedString(string: "Pull to refresh")
        refreshControl.addTarget(self, action: #selector(HistoryViewController.refresh), for: UIControlEvents.valueChanged)
        tableView.addSubview(refreshControl)

        // Activity indicator.
        activityIndicator = Utilities.addActivityIndicator(to: view)


        // Do any additional setup after loading the view.
        tableView.dataSource = self
        tableView.delegate = self
        
        // set receipts
        if let history = User.currentUser?.history
        {
            receipts = history
        }
        
        //getReceipts()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        getReceipts()
        print("calling view will appear")
    }
    
    func refresh(){
        self.receipts = []
        getReceipts()
        print("refreshing table view")
    }
    
    func getReceipts(){
        
        if let user = User.currentUser {
            activityIndicator.startAnimating()
             Receipt.getReceipts(userId: user.id, completion: { ( recps: [Receipt]) in
                self.activityIndicator.stopAnimating()

                self.receipts = recps
                print("just pulled \(recps.count) receipts...")
                if self.refreshControl.isRefreshing
                {
                    self.refreshControl.endRefreshing()
                }
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
        // What if no current receipt?
        controller.receiept = receipts[indexPath.row] as Receipt
        self.navigationController?.pushViewController(controller, animated: true)
        tableView.deselectRow(at: indexPath, animated: true)
        
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
