//
//  TabViewController.swift
//  FastCart
//
//  Created by Luis Perez on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit

class TabViewController: UIViewController {

    @IBOutlet weak var contentView: UIView!
    @IBOutlet var buttons: [UIButton]!
    
    
    var listViewController: UIViewController!
    var historyViewController: UIViewController!
    
    var viewControllers: [UIViewController]!
    private var defaultIndex = 1
    var selectedIndex: Int? {
        didSet(previousIndex) {
            updateViews(selectedIndex: selectedIndex ?? defaultIndex, previousIndex: previousIndex)
        }
    }
    
    @IBOutlet weak var underline: UIView!
    var underlineOriginalCenter: CGPoint?
    
    @IBOutlet weak var tabBar: UIView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        self.navigationController?.setNavigationBarHidden(true, animated: false)
        
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        listViewController = storyboard.instantiateViewController(withIdentifier: "ListViewController")
        
        historyViewController = storyboard.instantiateViewController(withIdentifier: "HistoryViewController")
        
        viewControllers = [historyViewController, listViewController]
        self.view.layoutIfNeeded()
        
        // Switch view ctonroller
        selectedIndex = defaultIndex
        
        // Do any additional setup after loading the view.
        let width = self.view.frame.size.width
        self.underline.frame.size.width = width / 2.0
        underlineOriginalCenter = underline.center
        underlineOriginalCenter?.x = width / 4.0 * 3.0
        
        if selectedIndex == 0 {
            self.underline.center.x = width / 4.0
        } else {
            self.underline.center.x = width / 4.0 * 3.0
        }
        for button in buttons {
            button.setTitleColor(UIColor.lightGray, for: .normal)
            button.setTitleColor(UIColor.darkGray, for: .selected)
            button.adjustsImageWhenHighlighted = false
        }
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        self.navigationController?.setNavigationBarHidden(true, animated: true)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func onTabButtonTap(_ sender: UIButton) {
        let previousIndex = selectedIndex
        selectedIndex = sender.tag
        updateViews(selectedIndex: selectedIndex!, previousIndex: previousIndex)
    }
    
    private func updateViews(selectedIndex: Int,  previousIndex: Int?) {
        buttons[selectedIndex].isSelected = true
        
        if let previousIndex = previousIndex {
            buttons[previousIndex].isSelected = false
            let previousVC = viewControllers[previousIndex]
            
            previousVC.willMove(toParentViewController: nil)
            previousVC.view.removeFromSuperview()
            previousVC.removeFromParentViewController()
        }
        
        let vc = viewControllers[selectedIndex]
        addChildViewController(vc)
        vc.view.frame = contentView.bounds
        contentView.addSubview(vc.view)
        vc.didMove(toParentViewController: self)
        
        // UIAnimations
        if selectedIndex == 1 {
//            buttons[selectedIndex].setTitleColor(UIColor.darkGray, for: .normal)
//            buttons[0].setTitleColor(UIColor.lightGray, for: .normal)
////            UIView.animate(withDuration: 1, animations: {
////                underline.trans
////            })
            
            UIView.animate(withDuration: 1, delay: 0, usingSpringWithDamping: 0.8, initialSpringVelocity: 0, options: [], animations: {
                if let center = self.underlineOriginalCenter {
                self.underline.center = center
                }
                
            }, completion: nil)
            
        }
            // selected history
        else {
//            buttons[selectedIndex].setTitleColor(UIColor.darkGray, for: .normal)
//            buttons[1].setTitleColor(UIColor.lightGray, for: .normal)
            UIView.animate(withDuration: 1, delay: 0, usingSpringWithDamping: 0.8, initialSpringVelocity: 0, options: [], animations: {
                if self.underlineOriginalCenter != nil {
                    
                    let width = self.view.frame.size.width
                    self.underline.center.x = width / 4.0
                    
                }
                
            }, completion: nil)
            
        }
    }
}
