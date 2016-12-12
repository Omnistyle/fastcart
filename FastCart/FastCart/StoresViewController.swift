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

class StoresViewController: SAParallaxViewController, UIGestureRecognizerDelegate, CLLocationManagerDelegate {
    private let kItemSectionHeaderViewID = "StoreCellHeaderView"
    private let kNumStores = 5
    private let kBannerText = "Free shipping! Use code: SHIP."
    private let kCollectionViewTopContraintID = "collectionViewTopContraint"
    
    private var isAdShown: Bool = false
    private var locationManager : CLLocationManager!
    
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
        
        // Get the user's location, since this is needed for nearby stores.
        // TODO(need to implement).
        locationManager = CLLocationManager()
        locationManager.delegate = self
        locationManager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
        locationManager.distanceFilter = 200
        locationManager.requestWhenInUseAuthorization()
        
        if let y = self.navigationController?.navigationBar.frame.height {
            let origin = CGPoint(x: 0, y: y + UIApplication.shared.statusBarFrame.size.height)
            self.addBanner(at: origin);
        }
        
        // Register the .xib for the custom header view and footerview.
        self.collectionView.register(UINib(nibName: "StoreCellHeaderView", bundle:nil), forSupplementaryViewOfKind: UICollectionElementKindSectionHeader, withReuseIdentifier: kItemSectionHeaderViewID)
    }
    
    private func createBannerView() -> UIView{
        let bannerView = UIView()
        bannerView.backgroundColor = Constants.themeColor
        
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
        tap.delegate = self
        bannerView.addGestureRecognizer(tap)
    
        return bannerView
    }
    
    private func addBanner(at origin: CGPoint) {
        let bannerView = createBannerView()
        
        // Add banner view.
        self.view.addLayoutSubview(bannerView, andConstraints:
            bannerView.top |+| origin.y,
            bannerView.left,
            bannerView.right,
            bannerView.height |==| Constants.kBannerHeight
        )
        isAdShown = true

        // Add collection view and manually adjust for the banner.
        let bannerBottom = origin.y + Constants.kBannerHeight
        self.view.addLayoutSubview(collectionView, andConstraints:
            // Add enough space for the banner to show.
            collectionView.top |+| bannerBottom -=- kCollectionViewTopContraintID,
            collectionView.left,
            collectionView.right,
            collectionView.bottom)
    }
    
    // Hides the banner. Public so selector can access it.
    func hideBanner(sender: UITapGestureRecognizer? = nil) {
        guard let notificationView = sender?.view  else { return }
        guard let topConstraint = self.view.constraints.first(where: { (el: NSLayoutConstraint) -> Bool in
            if let id = el.identifier {
                return id == kCollectionViewTopContraintID
            }
            return false
        }) else { return }
        
        self.view.layoutIfNeeded()
        
        // Set-up new contraints on the collection view.
        UIView.animate(withDuration: 0.7, delay: 0.0, options: [], animations: {
            let navBarFrame = self.navigationController!.navigationBar.frame
            
            // Move up and inset the content correctly.
            topConstraint.constant = 0
            self.collectionView.contentInset.top = navBarFrame.origin.y + navBarFrame.height
            self.view.layoutIfNeeded()
        }, completion: nil)
        // Delay a few seconds before removing, so no awkward whitespace and remove.
        UIView.animate(withDuration: 1.0, delay: 0.4, usingSpringWithDamping: 1.0, initialSpringVelocity: 0.0, options: [], animations: {
            notificationView.frame = CGRect(x: 0.0, y: 0.0, width: notificationView.frame.width, height: 0.0)
            
        }, completion: { (success: Bool) -> Void in
            self.isAdShown = false
            notificationView.removeFromSuperview()
        })
    }
    
    convenience init() {
        self.init(nibName: nil, bundle: nil)
    }
    
    override init(nibName nibNameOrNil: String?, bundle nibBundleOrNil: Bundle?) {
        super.init(nibName: nibNameOrNil, bundle: nibBundleOrNil)
    }
    
    required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
    }

    //MARK: - UICollectionViewDataSource
    override func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        // Each "item" will be in a seperate section.
        return 1
    }

    func numberOfSections(in collectionView: UICollectionView) -> Int {
        return kNumStores
    }
    override func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let rawCell = super.collectionView(collectionView, cellForItemAt: indexPath)
        guard let cell = rawCell as? SAParallaxViewCell else { return rawCell }
        
        for case let view as UILabel in cell.containerView.accessoryView.subviews {
            view.removeFromSuperview()
        }
        
        let index = indexPath.section
        let imageName = String(format: "image%d", rankStore(at: index) + 1)
        if let image = UIImage(named: imageName) {
            cell.setImage(image)
        }
        
        return cell
    }
    func collectionView(_ collectionView: UICollectionView, viewForSupplementaryElementOfKind kind: String, at indexPath: IndexPath) -> UICollectionReusableView {
        switch kind {
        case UICollectionElementKindSectionHeader:
            let headerView = collectionView.dequeueReusableSupplementaryView(ofKind: kind, withReuseIdentifier: "StoreCellHeaderView", for: indexPath) as! StoreCellHeaderView
            headerView.storeName.text = "Text"
            
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
    // Limit scrolling to height for beauty purposes.
    override func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let top: CGFloat = 0.0
        let topBounce = (isAdShown) ? 0 : (self.navigationController?.navigationBar.frame.height ?? 0)
        if (scrollView.contentOffset.y < top - topBounce) {
            scrollView.contentOffset = CGPoint(x: 0, y: top - topBounce);
        }
        let bottom = scrollView.contentSize.height - scrollView.frame.size.height
        let bottomBounce: CGFloat = self.tabBarController?.tabBar.frame.height ?? 0
        if scrollView.contentOffset.y > bottom + bottomBounce {
            scrollView.contentOffset = CGPoint(x: 0, y: bottom + bottomBounce);
        }
        
        super.scrollViewDidScroll(scrollView)
    }
}
