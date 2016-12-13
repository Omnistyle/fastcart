//
//  ShopViewController.swift
//  FastCart
//
//  Created by Belinda Zeng on 11/22/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import TLYShyNavBar
import SCLAlertView
import SideMenu

class ShopViewController: UIViewController, UICollectionViewDelegate, UICollectionViewDataSource, UICollectionViewDelegateFlowLayout, ScrollCellDelegate, UISearchResultsUpdating, UISearchBarDelegate, FiltersViewControllerDelegate {
    
    var store : Store?
    
    @IBOutlet weak var collectionView: UICollectionView!
    
    @IBOutlet weak var flowLayout: UICollectionViewFlowLayout!
    
    private var activityIndicator: UIActivityIndicatorView!
    private var isMoreDataLoading = false
    
    // Maps the item index to the current variant image index.
    private var variantIndexFor: [Int: Int] = [:]
    
    var products = [Product]()
    var searchTerm = "dress"
    
    var searchController: UISearchController!
    
    var selectedPrice = "500"
    var selectedShipping = [String]()
    var selectedColor = [String]()
    @IBOutlet weak var searchBarPlaceHolder: UIView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
    
        // Add activitiy indicator.
        self.activityIndicator = Utilities.addActivityIndicator(to: self.view)

        // Do any additional setup after loading the view.
        collectionView.delegate = self
        collectionView.dataSource = self
        
        self.shyNavBarManager.scrollView = self.collectionView
        
        // add right bar button item
        let refreshButton = UIBarButtonItem(barButtonSystemItem: UIBarButtonSystemItem.search, target: self, action: #selector(ShopViewController.buttonMethod))
        navigationItem.rightBarButtonItem = refreshButton
        
        self.navigationItem.title = "Shop"
        
        
        // search bar functions
        // Initializing with searchResultsController set to nil means that
        // searchController will use this view controller to display the search results
        searchController = UISearchController(searchResultsController: nil)
        searchController.searchResultsUpdater = self
        
        // If we are using this same view controller to present the results
        // dimming it out wouldn't make sense. Should probably only set
        // this to yes if using another controller to display the search results.
        searchController.dimsBackgroundDuringPresentation = false
        
        searchController.searchBar.sizeToFit()
        searchController.searchBar.delegate = self
//        searchBarPlaceHolder.addSubview(searchController.searchBar)
        self.shyNavBarManager.extensionView = searchController.searchBar
        automaticallyAdjustsScrollViewInsets = false
        definesPresentationContext = true
        
        // Sets this view controller as presenting view controller for the search interface
        definesPresentationContext = true
        
        
//        // shynav properties
//        self.shyNavBarManager.expansionResistance = 400
        
        
        // flow layout stuff
        flowLayout.minimumLineSpacing = 0
        flowLayout.minimumInteritemSpacing = 1
        flowLayout.sectionInset = UIEdgeInsetsMake(0, 0, 0, 0)
        
        // perform network request
        self.activityIndicator.startAnimating()
        WalmartClient.sharedInstance.getProductsWithSearchTerm(term: searchTerm, startIndex: "1", price: self.selectedPrice, color: self.selectedColor, shipping: self.selectedShipping, success: { (products: [Product]) in
            // get additional information
            for _ in products {
                // get product related info images
            }
            
            self.products = products
            self.activityIndicator.stopAnimating()
            self.collectionView.reloadData()
            
        }, failure: {(error: Error) -> () in
            self.activityIndicator.stopAnimating()
            Utilities.presentErrorAlert(title: "Network Failure", message: error.localizedDescription)
        })
        
        setUpSideMenu()
        
        
        getTrending()
    }
    
    func buttonMethod() {
        if let vc = SideMenuManager.menuRightNavigationController!.topViewController as? FiltersViewController {
            vc.delegate = self
        }
        present(SideMenuManager.menuRightNavigationController!, animated: true, completion: nil)
    }
    func setUpSideMenu() {
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let menuRightNavigationController = storyboard.instantiateViewController(withIdentifier: "FiltersRightNavigationController") as! UISideMenuNavigationController
        menuRightNavigationController.setNeedsStatusBarAppearanceUpdate()
        // UISideMenuNavigationController is a subclass of UINavigationController, so do any additional configuration of it here like setting its viewControllers.
        SideMenuManager.menuRightNavigationController = menuRightNavigationController
        
        
        
        // Enable gestures. The left and/or right menus must be set up above for these to work.
        // Note that these continue to work on the Navigation Controller independent of the View Controller it displays!
        SideMenuManager.menuAddPanGestureToPresent(toView: self.navigationController!.navigationBar)
        SideMenuManager.menuAddScreenEdgePanGesturesToPresent(toView: self.navigationController!.view)
    }
    var trendingView: UIView?
    var titleLabel: UILabel?
    var label: UILabel?
    func searchBarTextDidBeginEditing(_ searchBar: UISearchBar) {
        print("first started")
        blurEffect = UIBlurEffect(style: UIBlurEffectStyle.light)
        blurEffectView = UIVisualEffectView(effect: blurEffect)
        blurEffectView!.frame = view.bounds
        blurEffectView!.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(blurEffectView!)
        
        guard let trendingSearches = trending?.prefix(10) else {return}
       
        // title label
        titleLabel = UILabel()
        titleLabel!.text = "Trending"
        titleLabel!.font = UIFont.systemFont(ofSize: 30, weight: UIFontWeightLight)
        titleLabel!.frame = CGRect(x: CGFloat(20), y: CGFloat(75), width: view.frame.width, height: 50)
        view.addSubview(titleLabel!)
        
        // trending labels
        label = UILabel()
        
        var currentText = ""
    
        for trend in trendingSearches {
            currentText = currentText + trend + "\r\n\r\n"
        }
        
        label!.text = currentText
        label!.numberOfLines = 0
        label!.font = UIFont.systemFont(ofSize: 15, weight: UIFontWeightLight)
        label?.textColor = UIColor.black
        label!.frame = CGRect(x: CGFloat(20), y: CGFloat(150), width: view.frame.width - 40, height: 200)
        view.addSubview(label!)
        
        
    }
    var trending: [String]?
    
    func getTrending() {
        trendingView = UIView(frame: CGRect(x: CGFloat(0.0), y: CGFloat(30.0), width: view.frame.width, height: view.frame.height))
        
        WalmartClient.sharedInstance.getTrendingSearches(success: { (trending: [String]) in
            // get additional information
            self.trending = trending
            
        }, failure: {(error: Error) -> () in
            Utilities.presentErrorAlert(title: "Network Failure", message: error.localizedDescription)
        })
        
        
    }
    
    func searchBarCancelButtonClicked(_ searchBar: UISearchBar) {
        print("clicked cancel")
        if let titleLabel = titleLabel {
            titleLabel.removeFromSuperview()
        }
        if let label = label {
            label.removeFromSuperview()
        }
        if let blurEffectView = blurEffectView {
            blurEffectView.removeFromSuperview()
        }
    }
    
    var blurEffect: UIBlurEffect?
    var blurEffectView: UIVisualEffectView?
    func updateSearchResults(for searchController: UISearchController) {
        
        if let searchText = searchController.searchBar.text {
            // perform network request
            WalmartClient.sharedInstance.getProductsWithSearchTerm(term: searchText, startIndex: "1", success: { (products: [Product]) in
                // get additional information
                for _ in products {
                    // get product related info images
                }
                
                self.products = products
                self.collectionView.reloadData()
                
            }, failure: {(error: Error) -> () in
                self.activityIndicator.stopAnimating()
                Utilities.presentErrorAlert(title: "Network Failure", message: error.localizedDescription)
            })
        }
        
    }
    
    func searchBarSearchButtonClicked(_ searchBar: UISearchBar) {
        searchController.isActive = false
        searchBar.resignFirstResponder()
        
        if let titleLabel = titleLabel {
            titleLabel.removeFromSuperview()
        }
        if let label = label {
            label.removeFromSuperview()
        }
        if let blurEffectView = blurEffectView {
            blurEffectView.removeFromSuperview()
        }
        
        
        
    }
    
    // collection view
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return products.count
    }
    
    func handleTap(sender: UITapGestureRecognizer) {
        if let image = sender.view as? UIImageView {
            let cell = image.superview!.superview?.superview as! ProductOverviewCell
            // make sure it's above the image
            cell.heartImage.layer.zPosition = cell.productScrollView.layer.zPosition + 100
            if cell.heartImage.image == #imageLiteral(resourceName: "heart") {
                cell.heartImage.image = #imageLiteral(resourceName: "heart_filled")
            } else {
              cell.heartImage.image = #imageLiteral(resourceName: "heart")
            }

            
            let pulseAnimation:CABasicAnimation = CABasicAnimation(keyPath: "transform.scale")
            pulseAnimation.duration = 0.5
            pulseAnimation.toValue = NSNumber(value: 1.2)
            pulseAnimation.timingFunction = CAMediaTimingFunction(name: kCAMediaTimingFunctionEaseInEaseOut)
            pulseAnimation.autoreverses = true
            pulseAnimation.repeatCount = 1
            cell.heartImage.layer.add(pulseAnimation, forKey: nil)
            
        }

    }
    func handleCellTap(sender: UITapGestureRecognizer) {
        let cell = sender.view?.superview?.superview?.superview as! ProductOverviewCell
        let indexPath = collectionView.indexPath(for: cell)!
        collectionView(collectionView, didSelectItemAt: indexPath)
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let cell = collectionView.dequeueReusableCell(withReuseIdentifier: "ProductOverviewCell", for: indexPath) as! ProductOverviewCell
        cell.product = products[indexPath.row]
        
        // add tap target
        let tap = UITapGestureRecognizer(target: self, action: #selector(ShopViewController.handleTap))
        cell.heartImage.addGestureRecognizer(tap)
        // add scroll target
        cell.heartImage.isUserInteractionEnabled = true
        
        // Add tap target to image.
        let cellTap = UITapGestureRecognizer(target: self, action: #selector(ShopViewController.handleCellTap))
        cell.productScrollView.addGestureRecognizer(cellTap)
        
        // no top border for first two
        // if it's even
        if indexPath.row % 2 == 1 {
            let borderWidth = CGFloat(1)
            
            let frame = CGRect(x: 0, y: 0, width: borderWidth, height: collectionView.contentSize.height)
            let border = UIView(frame: frame)
            border.backgroundColor = UIColor(red: 240/255, green: 240/255, blue: 240/255, alpha: 1)
            cell.addSubview(border)
        }
        
        if indexPath.row != 0 && indexPath.row != 1 {
            // top border
            let borderWidth = CGFloat(1)
            let frame = CGRect(x: 0, y: 0, width: cell.frame.size.width, height: borderWidth)
            let border = UIView(frame: frame)
            border.backgroundColor = UIColor(red: 240/255, green: 240/255, blue: 240/255, alpha: 1)
            cell.addSubview(border)
        }
        
        // Overwrite current image if the user has already swiped through them.
        if let variantIndex = variantIndexFor[indexPath.item] {
            cell.imageIndex = variantIndex
        }
        
        
        return cell
    }
    
    let cellHeight = CGFloat(290)
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        
        // Sets to equal width and about 1 1/2 cells vertically on iphone 5s
        return CGSize(width: CGFloat(collectionView.frame.size.width / 2 - 0.5), height: cellHeight)
       
    }
    
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        let product = products[indexPath.row]
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let vc = storyboard.instantiateViewController(withIdentifier: "ProductDetailsViewController") as! ProductDetailsViewController
        vc.product = product
        vc.hidesBottomBarWhenPushed = true
        self.navigationController?.pushViewController(vc, animated: true)
        
    }
    
    // MARK: - ScrollCellDelegate 
    func didSelectIndexForCell(cell: UICollectionViewCell, index: Int) {
        if let item = collectionView.indexPath(for: cell)?.item {
            variantIndexFor[item] = index
        }
    }

    /*
     MARK: - Navigation

     In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
         Get the new view controller using segue.destinationViewController.
         Pass the selected object to the new view controller.
    }
    */
    
    func didFilter(view: FiltersViewController, selectedPrice: Int, selectedColor: [String], selectedShipping: [String]) {
        self.selectedPrice = String(describing: selectedPrice)
        self.selectedShipping = selectedShipping
        self.selectedColor = selectedColor
        WalmartClient.sharedInstance.getProductsWithSearchTerm(term: searchTerm, startIndex: "1", price: self.selectedPrice, color: self.selectedColor, shipping: self.selectedShipping, success: { (products: [Product]) in
            // get additional information
            for _ in products {
                // get product related info images
            }
            
            self.products = products
            self.activityIndicator.stopAnimating()
            self.collectionView.reloadData()
            
        }, failure: {(error: Error) -> () in
            self.activityIndicator.stopAnimating()
            Utilities.presentErrorAlert(title: "Network Failure", message: error.localizedDescription)
        })
    }
    
//    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
//        
//    }
    
    // MARK: - UIScrollView
    func loadMoreData() {
        let count = products.count
        let startIndex = String(count + 1)
        WalmartClient.sharedInstance.getProductsWithSearchTerm(term: searchTerm, startIndex: startIndex, success: {
             (products: [Product]) in
                // populate tableview with tweets
                self.products = self.products + products
                self.collectionView.reloadData()
                self.isMoreDataLoading = false
                //Stop the loading indicator
                self.activityIndicator.stopAnimating()
            
            
            
        }, failure: {(error: Error) -> () in
            self.activityIndicator.stopAnimating()
            print(error.localizedDescription)
        })
    }
    
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        if (!isMoreDataLoading) {
            // Calculate the position of one screen length before the bottom of the results
            let scrollViewContentHeight = collectionView.contentSize.height
            let scrollOffsetThreshold = scrollViewContentHeight - collectionView.bounds.size.height - collectionView.bounds.size.height / 2
            
            // When the user has scrolled past the threshold, start requesting
            if(scrollView.contentOffset.y > scrollOffsetThreshold && collectionView.isDragging) {
                isMoreDataLoading = true
                
                self.activityIndicator.startAnimating()
                
                // Code to load more results
                loadMoreData()
            }
        }
    }

}
