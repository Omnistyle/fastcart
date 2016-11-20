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
    var selectedIndex: Int = 1
    
    @IBOutlet weak var underline: UIView!
    var underlineOriginalCenter: CGPoint?
    
    @IBOutlet weak var tabBar: UIView!
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        listViewController = storyboard.instantiateViewController(withIdentifier: "ListViewController")
        historyViewController = storyboard.instantiateViewController(withIdentifier: "HistoryViewController")
        
        viewControllers = [historyViewController, listViewController]
        
        buttons[selectedIndex].isSelected = true
        onTabButtonTap(buttons[selectedIndex])
        
        // Do any additional setup after loading the view.
        underlineOriginalCenter = underline.center
        for button in buttons {
            button.setTitleColor(UIColor.lightGray, for: .normal)
            button.setTitleColor(UIColor.darkGray, for: .selected)
            button.adjustsImageWhenHighlighted = false
        }
        self.navigationController?.isNavigationBarHidden = true
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func onTabButtonTap(_ sender: UIButton) {
        let previousIndex = selectedIndex
        selectedIndex = sender.tag
        // add polish for changing text color and animating the UIView
        // selected current
        
        
        buttons[previousIndex].isSelected = false
        
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
                if let center = self.underlineOriginalCenter {
                    
                    let width = self.view.frame.size.width
                    self.underline.center.x = width / 4.0
                    
                }
                
            }, completion: nil)
            
        }
        
        
        let previousVC = viewControllers[previousIndex]
        
        previousVC.willMove(toParentViewController: nil)
        previousVC.view.removeFromSuperview()
        previousVC.removeFromParentViewController()
        
        sender.isSelected = true
        let vc = viewControllers[selectedIndex]
        addChildViewController(vc)
        vc.view.frame = contentView.bounds
        contentView.addSubview(vc.view)
        vc.didMove(toParentViewController: self)
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
