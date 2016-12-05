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
    private class Constants {
        static let numStores = 6
        static let bannerHeight = CGFloat(40.0)
    }
    
    private var isAdShown: Bool = false
    private var first: Bool = true
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        if let y = self.navigationController?.navigationBar.frame.height {
            let origin = CGPoint(x: 0, y: y + UIApplication.shared.statusBarFrame.size.height)
            self.addBanner(at: origin);
        }
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
    override func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return Constants.numStores
    }
    
    //MARK: - UICollectionViewDataSource
    override func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        let rawCell = super.collectionView(collectionView, cellForItemAt: indexPath)
        guard let cell = rawCell as? SAParallaxViewCell else { return rawCell }
        
        for case let view as UILabel in cell.containerView.accessoryView.subviews {
            view.removeFromSuperview()
        }
        
        let index = indexPath.row
        let imageName = String(format: "image%d", rankStore(at: index) + 1)
        if let image = UIImage(named: imageName) {
            cell.setImage(image)
            // hacky way to get first image to work?
            if imageName == "image1" && self.first {
                // We do this because we hide part of the image behind the navbar?
                cell.containerView.setParallaxStartPosition(-self.navigationController!.navigationBar.frame.height/3)
                self.first = false
            }
        }
        
        return cell
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
        
        // for now,
        print("clicked on a store ad")
        // do the segue
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let vc = storyboard.instantiateViewController(withIdentifier: "ShopViewController") as! ShopViewController
        vc.store = Store.init(id: "1")
        self.navigationController?.pushViewController(vc, animated: true)
        
//        let viewController = DetailViewController()
//        viewController.transitioningDelegate = self
//        viewController.trantisionContainerView = containerView
//        
//        present(viewController, animated: true, completion: nil)
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
