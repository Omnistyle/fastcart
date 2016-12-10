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

class StoresViewController: SAParallaxViewController, UIGestureRecognizerDelegate {
    private var kItemSectionHeaderViewID = "StoreCellHeaderView"
    private class Constants {
        static let numStores = 5
        static let bannerHeight = CGFloat(40.0)
    }
    
    private var isAdShown: Bool = false
    
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
        
        if let y = self.navigationController?.navigationBar.frame.height {
            let origin = CGPoint(x: 0, y: y + UIApplication.shared.statusBarFrame.size.height)
            self.addBanner(at: origin);
        }
        
        // Register the .xib for the custom header view and footerview.
        self.collectionView.register(UINib(nibName: "StoreCellHeaderView", bundle:nil), forSupplementaryViewOfKind: UICollectionElementKindSectionHeader, withReuseIdentifier: kItemSectionHeaderViewID)
    }
    
    private func addBanner(at origin: CGPoint) {
        let view = UIView()
        view.backgroundColor = UIColor(red: 114/255, green: 190/255, blue: 183/255, alpha: 1)
        
        // add label
        let text = "Free shipping on orders over $50, use promo code: SHIP."
        let label = UILabel()
        label.font = label.font.withSize(13.0)
        label.text = text
        label.textColor = UIColor.white
        view.addLayoutSubview(label, andConstraints:
            label.top,
            label.right |+| 10,
            label.left |+| 10,
            label.bottom)
        
        view.isUserInteractionEnabled = true
        // add touch target
        let tap = UITapGestureRecognizer(target: self, action: #selector(self.hideBanner(sender:)))
        tap.delegate = self
        view.addGestureRecognizer(tap)
        
        // Add top view.
        self.view.addLayoutSubview(view, andConstraints:
            view.top |+| origin.y,
            view.left,
            view.right,
            view.height |==| Constants.bannerHeight
        )
        isAdShown = true

        // Add collection view. (Manually!)
        self.view.addLayoutSubview(collectionView, andConstraints:
            collectionView.top |==| view.bottom,
            collectionView.left,
            collectionView.right,
            collectionView.bottom)
 }
    
    // Hides the banner,
    func hideBanner(sender: UITapGestureRecognizer? = nil) {
        if let notificationView = sender?.view {
            UIView.animate(withDuration: 0.7, delay: 0.0, options: [], animations: {
                // Move up!
                self.collectionView.frame = CGRect(
                    x: self.collectionView.frame.origin.x,
                    y: self.collectionView.frame.origin.y - notificationView.frame.height - self.navigationController!.navigationBar.frame.height,
                    width: self.collectionView.frame.width,
                    height: self.collectionView.frame.height + notificationView.frame.height + self.navigationController!.navigationBar.frame.height)
            }, completion: nil)
            // Delay a few seconds before removing, so no awkward whitespace.
            UIView.animate(withDuration: 1.0, delay: 0.4, usingSpringWithDamping: 1.0, initialSpringVelocity: 0.0, options: [], animations: {
                notificationView.frame = CGRect(x: 0.0, y: 0.0, width: notificationView.frame.width, height: 0.0)
                self.isAdShown = false
            })
        }
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
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
        return Constants.numStores
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
