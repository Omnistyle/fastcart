//
//  StoresViewController.swift
//  FastCart
//
//  Created by Luis Perez on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import SAParallaxViewControllerSwift
import MisterFusion
import CoreLocation

class StoresViewController: SAParallaxViewController, CLLocationManagerDelegate {
    private let kItemSectionHeaderViewID = "StoreCellHeaderView"
    private let kBannerText = "Free shipping! Use code: SHIP."
    
    private var locationManager : CLLocationManager!
    
    var fakeStores = [Store]()
    // Override the collection view initialization to use our own
    // StickyHeaderFlowLayout()
    private var _collectionView: UICollectionView?
    override var collectionView: UICollectionView {
        get {
            if _collectionView == nil {
                _collectionView = UICollectionView(frame: .zero, collectionViewLayout: StickyHeaderFlowLayout())
            }
            return _collectionView!
        }
        set(value) {
            _collectionView = value
        }
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Navbar navigation!
        self.shyNavBarManager.scrollView = collectionView
        self.shyNavBarManager.expansionResistance = 20
        
        // Get the user's location, since this is needed for nearby stores.
        // TODO(need to implement).
        locationManager = CLLocationManager()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
        locationManager.distanceFilter = 200
        locationManager.requestWhenInUseAuthorization()
        
        // We pre-populate fake stores, though eventually we will use location to get these!
        fakeStores = getStores()
        
        self.addBannerAsExtension()
        
        self.view.addLayoutSubview(collectionView, andConstraints:
            collectionView.top,
            collectionView.left,
            collectionView.right,
            collectionView.bottom)
        self.collectionView.contentInset.bottom = self.tabBarController!.tabBar.frame.height
        
        // Register the .xib for the custom header view and footerview.
        self.collectionView.register(UINib(nibName: "StoreCellHeaderView", bundle:nil), forSupplementaryViewOfKind: UICollectionElementKindSectionHeader, withReuseIdentifier: kItemSectionHeaderViewID)
        self.collectionView.bounces = false
    }
    
    private func createBannerView() -> UIView{
        let bannerView = UIView()
        bannerView.backgroundColor = Constants.themeColor
        bannerView.frame = CGRect(x: 0, y: 0, width: self.view.frame.width, height: Constants.kBannerHeight)
        
        // add label
        let label = UILabel()
        label.text = kBannerText
        label.textColor = UIColor.white
        label.numberOfLines = 1;
        label.textAlignment = .center
        label.font = label.font.withSize(14.0)
        label.minimumScaleFactor = 1.0 / 14.0
        label.adjustsFontSizeToFitWidth = true
        label.sizeToFit()
        
        bannerView.addLayoutSubview(label, andConstraints:
        label.top,
        label.right |+| 10,
        label.left |+| 10,
        label.bottom)
        
        bannerView.isUserInteractionEnabled = true
        // add touch target
        let tap = UITapGestureRecognizer(target: self, action: #selector(self.hideBanner(sender:)))
        bannerView.addGestureRecognizer(tap)
    
        return bannerView
    }
    
    private func addBannerAsExtension() {
        // Add banner as an extension view.
        let bannerView = createBannerView()
        self.shyNavBarManager.extensionView = bannerView
    }
    
    // Hides the banner. Public so selector can access it.
    func hideBanner(sender: UITapGestureRecognizer? = nil) {
        guard sender != nil  else { return }
        
        UIView.animate(withDuration: 1.0, animations: {
            guard let bannerView = self.shyNavBarManager.extensionView else { return }
            bannerView.frame = CGRect(x: 0, y: 0, width: bannerView.frame.width, height: 0)
            self.shyNavBarManager.extensionView = nil
        })
    }
    private func getStores() -> [Store]{
        let stores = ["Shop Redemption", "Trader Joes", "Walmart", "Whole Foods", "Macys"]
        let storesIcon = [#imageLiteral(resourceName: "StoreImageIcon1"), #imageLiteral(resourceName: "StoreImageIcon2"), #imageLiteral(resourceName: "StoreImageIcon3"),#imageLiteral(resourceName: "StoreImageIcon4"), #imageLiteral(resourceName: "StoreImageIcon5")]
        return zip(stores, storesIcon).enumerated().map( { (offset: Int, data: (name: String, icon: UIImage)) -> Store in
            let store = Store(id: "\(offset)", name: data.name, overview: "Test Store \(offset)!", image: "")
            store._image = data.icon
            return store
        })
    }
    
    //MARK: - UICollectionViewDataSource
    override func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        // Each "item" will be in a seperate section.
        return 1
    }

    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return fakeStores.count
    }
    override func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let rawCell = super.collectionView(collectionView, cellForItemAt: indexPath)
        guard let cell = rawCell as? SAParallaxViewCell else { return rawCell }
        
        for case let view as UILabel in cell.containerView.accessoryView.subviews {
            view.removeFromSuperview()
        }
        
        let index = indexPath.section
        let imageName = String(format: "StoreImage%d", rankStore(at: index) + 1)
        if let image = UIImage(named: imageName) {
            cell.setImage(image)
        }
        
        return cell
    }
    func collectionView(_ collectionView: UICollectionView, viewForSupplementaryElementOfKind kind: String, at indexPath: IndexPath) -> UICollectionReusableView {
        switch kind {
        case UICollectionElementKindSectionHeader:
            let headerView = collectionView.dequeueReusableSupplementaryView(ofKind: kind, withReuseIdentifier: kItemSectionHeaderViewID, for: indexPath) as! StoreCellHeaderView
            headerView.store = fakeStores[indexPath.section]
            
            // Add tap target!
            let tap = UITapGestureRecognizer(target: self, action: #selector(StoresViewController.handleTap))
            headerView.favoriteImage.addGestureRecognizer(tap)
            headerView.favoriteImage.isUserInteractionEnabled = true
            
            return headerView
        case UICollectionElementKindSectionFooter:
            return UICollectionReusableView()
        default:
            assert(false, "Unsupported supplementary view kind: \(kind)")
            return UICollectionReusableView()
        }
        
    }
    private func rankStore(at index: Int) -> Int {
        return index
    }
    
    func handleTap(sender: UITapGestureRecognizer) {
        guard let user = User.currentUser else { return }
        if let image = sender.view as? UIImageView {
            let cell = image.superview!.superview as! StoreCellHeaderView
            // Like
            if cell.favoriteImage.image == #imageLiteral(resourceName: "heart") {
                cell.favoriteImage.image = #imageLiteral(resourceName: "heart_filled")
                user.favoriteStores.append(cell.store)
            }
            // Dislike
            else {
                cell.favoriteImage.image = #imageLiteral(resourceName: "heart")
                user.favoriteStores = user.favoriteStores.filter({ (store: Store) -> Bool in
                    store.id != cell.store.id
                })
            }
            //
            let pulseAnimation:CABasicAnimation = CABasicAnimation(keyPath: "transform.scale")
            pulseAnimation.duration = 0.5
            pulseAnimation.toValue = NSNumber(value: 1.2)
            pulseAnimation.timingFunction = CAMediaTimingFunction(name: kCAMediaTimingFunctionEaseInEaseOut)
            pulseAnimation.autoreverses = true
            pulseAnimation.repeatCount = 1
            cell.favoriteImage.layer.add(pulseAnimation, forKey: nil)
            
        }
    }
    
    //MARK: - UICollectionViewDelegate
    override func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        super.collectionView(collectionView, didSelectItemAt: indexPath)
        
        guard let cells = collectionView.visibleCells as? [SAParallaxViewCell] else { return }
        let containerView = SATransitionContainerView(frame: view.bounds)
        containerView.setViews(cells, view: view)
        
        // do the segue
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let vc = storyboard.instantiateViewController(withIdentifier: "ShopViewController") as! ShopViewController
        vc.store = Store.init(id: "1")
        self.navigationController?.pushViewController(vc, animated: true)
    }
}
