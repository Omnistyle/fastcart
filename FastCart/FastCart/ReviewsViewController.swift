//
//  ReviewsViewController.swift
//  FastCart
//
//  Created by Jose Villanuva on 12/4/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class ReviewsViewController: UIViewController, UITableViewDataSource, UITableViewDelegate {

    var itemId: String = ""
    var reviews : [Review] = []
    
    @IBOutlet weak var reviewsTable: UITableView!
    
    
    override func viewDidLoad() {
        super.viewDidLoad()

        self.reviewsTable.dataSource = self
        self.reviewsTable.delegate = self
        self.reviewsTable.rowHeight = UITableViewAutomaticDimension
        self.reviewsTable.estimatedRowHeight = 140
        
        self.automaticallyAdjustsScrollViewInsets = false
        
        
        getReviews()
        // Do any additional setup after loading the view.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func getReviews(){
        WalmartClient.sharedInstance.getReviewsFromProduct(itemId: itemId, success: { (reviews:[Review]) in
            self.reviews = reviews
            self.reviewsTable.reloadData()
        }, failure: {(error: Error) -> () in
            print(error.localizedDescription)
        })
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int
    {
        if self.reviews != nil {
            return self.reviews.count
        } else {
            return 0
        }
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "ReviewCell", for: indexPath) as! ReviewCell
        
        cell.review = reviews[indexPath.row]
        return cell
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
