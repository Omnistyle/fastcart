//
//  ReviewsViewController.swift
//  FastCart
//
//  Created by Jose Villanuva on 12/4/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class ReviewsViewController: UIViewController, UITableViewDataSource, UITableViewDelegate, UIScrollViewDelegate {

    var itemId: String = ""
    var reviews : [Review] = []
    
    @IBOutlet weak var reviewsTable: UITableView!
    
    private var loadingView: UIActivityIndicatorView!
    private var wasNavHidden: Bool?
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        let navigationFrame = self.navigationController!.navigationBar.frame
        self.title = "Reviews"
        reviewsTable.contentInset = UIEdgeInsetsMake(navigationFrame.origin.y + navigationFrame.height, reviewsTable.contentInset.left, 0, reviewsTable.contentInset.right);
    }
    override func viewDidLoad() {
        super.viewDidLoad()
        
        loadingView = Utilities.addActivityIndicator(to: self.view)

        self.reviewsTable.dataSource = self
        self.reviewsTable.delegate = self
        self.reviewsTable.rowHeight = UITableViewAutomaticDimension
        self.reviewsTable.estimatedRowHeight = 140
        
        self.automaticallyAdjustsScrollViewInsets = false
        
        
        getReviews()
        // Do any additional setup after loading the view.
    }
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        wasNavHidden = navigationController?.isNavigationBarHidden
        navigationController?.setNavigationBarHidden(false, animated: true)
    }
    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)
        if let wasNavHidden = wasNavHidden {
            navigationController?.setNavigationBarHidden(wasNavHidden, animated: true)
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func getReviews(){
        loadingView.startAnimating()
        WalmartClient.sharedInstance.getReviewsFromProduct(itemId: itemId, success: { (reviews:[Review]) in
            self.reviews = reviews
            self.loadingView.stopAnimating()
            self.reviewsTable.reloadData()
        }, failure: {(error: Error) -> () in
            self.loadingView.stopAnimating()
            Utilities.presentErrorAlert(title: "Network Error", message: error.localizedDescription)
        })
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return self.reviews.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "ReviewCell", for: indexPath) as! ReviewCell
        
        cell.review = reviews[indexPath.row]
        
        // separator insets
        cell.preservesSuperviewLayoutMargins = false
        cell.separatorInset = UIEdgeInsets.zero
        cell.layoutMargins = UIEdgeInsets.zero
        
        return cell
    }
    
    @IBAction func OnBackToProdcut(_ sender: Any) {
        self.dismiss(animated: true, completion: {
            //do nothin
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
