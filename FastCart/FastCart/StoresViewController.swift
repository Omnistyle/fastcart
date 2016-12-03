//
//  StoresViewController.swift
//  FastCart
//
//  Created by Luis Perez on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import SAParallaxViewControllerSwift


class StoresViewController: SAParallaxViewController, UIGestureRecognizerDelegate {
    private class Constants {
        static let numStores = 8
        static let bannerHeight = CGFloat(40.0)
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        if let y = self.navigationController?.navigationBar.frame.height {
            let origin = CGPoint(x: 0, y: y + UIApplication.shared.statusBarFrame.size.height)
            self.addBanner(at: origin);
        }
    }
    
    private func addBanner(at origin: CGPoint) {
        let frame = CGRect(origin: origin, size: CGSize(width: self.view.frame.size.height, height: Constants.bannerHeight))
        let view = UIView(frame: frame)
        view.backgroundColor = UIColor(red: 114/255, green: 190/255, blue: 183/255, alpha: 1)
        
        // add label
        let text = "Free shipping on orders over $50, use promo code: SHIP."
        let label = UILabel(frame: CGRect(x: 15.0, y: 0.0, width: view.frame.size.width, height: view.frame.size.height))
        label.font = label.font.withSize(13.0)
        label.text = text
        label.textColor = UIColor.white
        view.addSubview(label)
        
        view.isUserInteractionEnabled = true
        // add touch target
        let tap = UITapGestureRecognizer(target: self, action: #selector(self.hideBanner(sender:)))
        tap.delegate = self
        view.addGestureRecognizer(tap)

        // TODO should push everything else down
        // TODO parallax doesn't look amazing
        
        self.view.addSubview(view)
    }
    // hide banner if people find it annoying
    func hideBanner(sender: UITapGestureRecognizer? = nil) {
        if let notificationView = sender?.view {
        UIView.animate(withDuration: 0.5, delay: 0, usingSpringWithDamping: 1.0, initialSpringVelocity: 0.0, options: .curveLinear, animations: {
            notificationView.frame = CGRect(x: 0.0, y: 0.0, width: notificationView.frame.width, height: 0.0)

        }) { if $0 {
            notificationView.removeFromSuperview()
            }
        }
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
            if index == 0 {
                cell.setImageOffset(CGPoint(x: 0, y: -100))
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
}
