//
//  TrendingSearchesViewController.swift
//  FastCart
//
//  Created by Belinda Zeng on 12/9/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class TrendingSearchesViewController: UIViewController, UITableViewDelegate, UITableViewDataSource {
    var trending : [String]?
    let numTrending = 10
    
    @IBOutlet weak var tableView: UITableView!
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        tableView.dataSource = self
        tableView.delegate = self
        
    }
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        guard let trending = trending else {return 0}
        if trending.count >= numTrending {
            return numTrending
        }
        return trending.count
    }

    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        print("getting called")
        let identifier = "SearchCell"
        let cell =  UITableViewCell.init(style: UITableViewCellStyle.default, reuseIdentifier: identifier)
        cell.backgroundColor = UIColor.clear
        
        guard let trending = trending else {return cell}
        cell.textLabel?.text = trending[indexPath.row]
        print(trending[indexPath.row])
        return cell
    }
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
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
