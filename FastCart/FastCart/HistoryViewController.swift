//
//  HistoryViewController.swift
//  FastCart
//
//  Created by Luis Perez on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import Parse

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
        //getZombiReceipts()
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        getReceipts()
        print("calling view will appear")
    }
    
    @objc func refresh(){
        self.receipts = []
        getReceipts()
        print("refreshing table view")
    }
    
    func getReceipts(){
        activityIndicator.startAnimating()
        if let user = User.currentUser {
             Receipt.getReceipts(userId: user.id, completion: { ( recps: [Receipt]) in
                if self.activityIndicator.isAnimating {
                    self.activityIndicator.stopAnimating()
                }
                
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
        controller.hidesBottomBarWhenPushed = true
        controller.receiept = receipts[indexPath.row] as Receipt
        self.navigationController?.pushViewController(controller, animated: true)
        tableView.deselectRow(at: indexPath, animated: true)
        
    }
    
//    func tableView(_ tableView: UITableView, willDisplay cell: UITableViewCell, forRowAt indexPath: IndexPath) {
//        
//        let dark = UIColor(red: 0.08, green: 0.09,blue: 0.10, alpha: 1.0)
//        
//        //1. Setup the CATransform3D structure
//        
//        let num = Float(90.0*M_PI)/Float(180.0)
//        var rotation: CATransform3D = CATransform3DMakeRotation(CGFloat(num), 0.0, 0.7, 0.4)
//        let num2 = Float(1.0)/Float(-600.0)
//        rotation.m34 = CGFloat(num2)
//        
//        
//        //2. Define the initial state (Before the animation)
//        cell.layer.shadowColor = dark.cgColor
//        cell.layer.shadowOffset = CGSize(width: 10, height: 10)
//        cell.alpha = 0
//        
//        cell.layer.transform = rotation
//        cell.layer.anchorPoint = CGPoint(x: 0.0, y: 0.5)
//        
//        if(cell.layer.position.x != 0){
//            cell.layer.position = CGPoint(x:0, y:cell.layer.position.y);
//        }
//        
//        
//        //3. Define the final state (After the animation) and commit the animation
//        UIView.beginAnimations("rotation", context: nil)
//        UIView.setAnimationDuration(0.8)
//        cell.layer.transform = CATransform3DIdentity;
//        cell.alpha = 1;
//        cell.layer.shadowOffset = CGSize(width: 0, height: 0)
//        UIView.commitAnimations()
//    }


    
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
    
//    func getZombiReceipts(){
//        Receipt.getAllReceipts { (recpts:[Receipt]) in
//            for recp in recpts {
//                Product.getProducts(receiptId: recp.id!, completion: { (prdcts:[Product]) in
//                    if prdcts.count == 0 {
//                        print("Receipt with id \(recp.id) has \(prdcts.count) products aka ZOMBIES")
//                    } else {
//                        //print("Receipt with id \(recp.id) has \(prdcts.count) products")
//                    }
//                })
//            }
//        }
//    }
}
