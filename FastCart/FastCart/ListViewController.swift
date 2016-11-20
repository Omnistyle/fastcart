//
//  ListsViewController.swift
//  FastCart
//
//  Created by Luis Perez on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class ListViewController: UIViewController, UITableViewDataSource, UITableViewDelegate, UITextViewDelegate {

    @IBOutlet weak var tableView: UITableView!
    @IBOutlet weak var subtotalLabel: UILabel!
    
    @IBOutlet weak var checkoutButton: UIButton!
    
    @IBOutlet weak var addItemTextView: UITextView!
    
    var products = [Product]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        tableView.delegate = self
        tableView.dataSource = self
        
        // Do any additional setup after loading the view.
        // so it resizes
        tableView.rowHeight = UITableViewAutomaticDimension
        // for the scrollbar
        tableView.estimatedRowHeight = 120
        
        addItemTextView.delegate = self
        
        // format checkout button
        checkoutButton.layer.cornerRadius = 5
        
    }
    
    func addProduct() {
        let product = Product(dictionary: ["name": addItemTextView.text], api: apiType.manual)
        User.currentUser?.current.products.append(product)
        products.append(product)
        tableView.reloadData()
        addItemTextView.text = ""
    }
    
    func textViewDidBeginEditing(_ textView: UITextView) {
        textView.text = ""
    }
    
    func textView(_ textView: UITextView, shouldChangeTextIn range: NSRange, replacementText text: String) -> Bool {
        if(text == "\n") {
            textView.resignFirstResponder()
            addProduct()
            return false
        }
        return true
    }
    
    override func viewWillAppear(_ animated: Bool) {
        if let currentProducts = User.currentUser?.current.products {
            products = currentProducts
        }
        tableView.reloadData()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func onCheckout(_ sender: UIButton) {
        // TODO: Implement checkout functionality.
    }

    @IBAction func onAddItemWithScanner(_ sender: UIButton) {
    }
    
    /*
    // MARK: - UITableViewDelegate
    */
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return products.count
    }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "ProductCell") as! ProductCell
        cell.product = products[indexPath.row]
        return cell
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        // deselect the cell and get relevant product
        tableView.deselectRow(at: indexPath, animated: true)
        let product = products[indexPath.row]
        
        // prepare for segue
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let productDetailsViewController = storyboard.instantiateViewController(withIdentifier: "ProductDetailsWithScrollViewController") as! ProductDetailsViewController
       productDetailsViewController.product = product
    
        // segue to the details view
        self.show(productDetailsViewController, sender: self)
        
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
