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
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        listViewController = storyboard.instantiateViewController(withIdentifier: "ListViewController")
        historyViewController = storyboard.instantiateViewController(withIdentifier: "HistoryViewController")
        
        viewControllers = [historyViewController, listViewController]
        
        buttons[selectedIndex].isSelected = true
        onTabButtonTap(buttons[selectedIndex])
        
        // Do any additional setup after loading the view.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    @IBAction func onTabButtonTap(_ sender: UIButton) {
        let previousIndex = selectedIndex
        selectedIndex = sender.tag
        // add polish for changing text color and animating the UIView
        
        
        buttons[previousIndex].isSelected = false
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
