//
//  ProfileViewController.swift
//  FastCart
//
//  Created by Luis Perez on 11/8/16.
//  Copyright © 2016 LemonBunny. All rights reserved.
//

import UIKit
import FBSDKLoginKit
import MXParallaxHeader

class ProfileViewController: UIViewController, FBSDKLoginButtonDelegate, UITableViewDelegate, UITableViewDataSource  {
    
    var scrollView: MXScrollView!
    
    @IBOutlet weak var table1: UITableView!
//    var table1: UITableView!
    let titlesInSection1 = ["Recent orders", "My reviews", "Upgrade to Pro"]
    let titlesInSection2 = ["How it works", "Contact us", "Rate the app", "Invite friends"]
    
    var table2: UITableView!
    
    override func viewDidLoad() {
        super.viewDidLoad()

        let loginButton = FBSDKLoginButton()
        view.addSubview(loginButton)
        
        loginButton.frame = CGRect(x: 16, y: 450, width: view.frame.width - 32, height: 50)
        loginButton.delegate = self
        
        // Do any additional setup after loading the view.
        // Parallax Header
        scrollView = MXScrollView()
        let header = Bundle.main.loadNibNamed("StarshipHeader", owner: self, options: nil)?.first as? CustomHeader
        header?.backgroundImageUrl = URL(string: "http://www.designbolts.com/wp-content/uploads/2013/02/Noise-Light-Grey-Tileable-Pattern-For-Website-Background.jpg")
        
//        header?.foregroundImageUrl = URL(string: "https://pbs.twimg.com/profile_images/575763771932573696/4UoYccGP.jpeg")
        header?.foregroundImageVariable = #imageLiteral(resourceName: "profileImage")
//        header?.foregroundImageVariable = UIImage(#imageLiteral(resourceName: "profileImage"))
        scrollView.parallaxHeader.view = header// You can set the parallax header view from a nib.
        scrollView.parallaxHeader.height = 250
        scrollView.parallaxHeader.mode = MXParallaxHeaderMode.fill
        scrollView.parallaxHeader.minimumHeight = 20
        view.addSubview(scrollView)
        
//        table1 = UITableView()
        
        // tableview 
        
        table1.dataSource = self;
        table1.delegate = self
        table1.backgroundColor = UIColor.white
        scrollView.addSubview(table1)
        // hide first section header
        table1.contentInset = UIEdgeInsetsMake(-1.0, 0.0, 0.0, 0.0);
        // get rid of empty cells
        
    }
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        
        var frame = view.frame
        
        scrollView.frame = frame
        scrollView.contentSize = frame.size
        
        frame.size.height = table1.contentSize.height
        table1.frame = frame
        
    }
    
    func tableView(_ tableView: UITableView, heightForHeaderInSection section: Int) -> CGFloat {
        // set height to 1 for the first section header
        if (section == 0) {
            return 1.0
        }
        return 40
    }
    func tableView(_ tableView: UITableView, heightForFooterInSection section: Int) -> CGFloat {
        return 0.00001
    }
    
    func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
        print(section)
        print("get here")
        let headerView = UIView.init(frame: CGRect(x: 0, y: 0, width: tableView.bounds.size.width, height: 50))
        let lblHeader = UILabel.init(frame: CGRect(x: 15, y: 13, width: tableView.bounds.size.width - 10, height: 24))
        if section == 1 {
            lblHeader.text = "About Shoply"
        }
        lblHeader.font = UIFont (name: "Helvetica", size: 14)
        lblHeader.textColor = UIColor(colorLiteralRed: 179.0/255.0, green: 179.0/255.0, blue: 179.0/255.0, alpha: 1.0)

        headerView.addSubview(lblHeader)
        headerView.backgroundColor = UIColor(colorLiteralRed: 248.0/255.0, green: 248.0/255.0, blue: 248.0/255.0, alpha: 1.0)
        return headerView
    }
    
    func numberOfSections(in tableView: UITableView) -> Int {
        return 2
    }
    
    // table functions
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if section == 0 {
            return titlesInSection1.count
        }
        return titlesInSection2.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        let cell = tableView.dequeueReusableCell(withIdentifier: "OptionCell") as! OptionCell
        
//        if (cell == nil) {
//            cell = UITableViewCell(style: UITableViewCellStyle.default, reuseIdentifier: "OptionCell") as! OptionCell
//        }
        if indexPath.section == 0 {
            cell.optionLabel.text = titlesInSection1[indexPath.row]
        } else if indexPath.section == 1 {
            cell.optionLabel.text = titlesInSection2[indexPath.row]
        }
        
        cell.backgroundColor = UIColor.white
        
        // separator insets
        cell.preservesSuperviewLayoutMargins = false
        cell.separatorInset = UIEdgeInsets.zero
        cell.layoutMargins = UIEdgeInsets.zero
        
        return cell
    }
    
    // scroll view delegate
//    func scrollViewDidScroll(_ scrollView: UIScrollView) {
//        print("progress %f", scrollView.parallaxHeader.progress)
//    }
    
    //
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
    }
    
    func loginButtonDidLogOut(_ loginButton: FBSDKLoginButton!) {
        User.currentUser = nil
        
        NotificationCenter.default.post(name: NSNotification.Name(rawValue: User.userDidLogoutNotification), object: nil)
        
        print("did log out of facebook")
    }

    func loginButton(_ loginButton: FBSDKLoginButton!, didCompleteWith result: FBSDKLoginManagerLoginResult!, error: Error!) {
        if error != nil {
            print(error)
            return
        }
        
        print("succesfully login with facebook...")
        
        FBSDKGraphRequest(graphPath: "/me", parameters: ["fields" : "id, name, email"]).start { (connecion, result, error) in
            if error != nil {
                print("failed to start graph")
                print(error?.localizedDescription ?? "undefined error")
                return
            }
        }
        
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
