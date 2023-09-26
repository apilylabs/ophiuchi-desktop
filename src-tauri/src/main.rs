// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::process::Command;

#[tauri::command(rename_all = "snake_case")]
fn add_cert_to_keychain(pem_file_path: String) {
    // Get the user's home directory
    if let Some(home_dir) = env::var_os("HOME") {
        if let Some(home_dir_str) = home_dir.to_str() {
            // Create the full path to the keychain file
            let keychain_path = format!("{}/Library/Keychains/login.keychain-db", home_dir_str);

            // Create a command to execute
            let mut command = Command::new("security");

            // Add arguments to the command
            command
                .arg("add-trusted-cert")
                // .arg("-d")
                .arg("-k")
                .arg(&keychain_path) // Use the resolved keychain path
                .arg(&pem_file_path); // Use the provided PEM file path

            // Execute the command
            let output = command.output().expect("Failed to execute command");

            // Check the command's exit status
            if output.status.success() {
                println!("Certificate added successfully.");
            } else {
                eprintln!("Error: {:?}", output);
            }
        } else {
            eprintln!("Failed to convert home directory to string.");
        }
    } else {
        eprintln!("Home directory not found.");
    }
}


#[tauri::command(rename_all = "snake_case")]
fn remove_cert_from_keychain(name: String) {
    // Get the user's home directory
    if let Some(home_dir) = env::var_os("HOME") {
        if let Some(home_dir_str) = home_dir.to_str() {
            // Create the full path to the keychain file
            let keychain_path = format!("{}/Library/Keychains/login.keychain-db", home_dir_str);

            // Create a command to execute
            let mut command = Command::new("security");

            // Add arguments to the command
            command
                .arg("delete-certificate")
                .arg("-c")
                .arg(name)
                .arg("-t")
                .arg(&keychain_path); // Use the resolved keychain path

            // Execute the command
            let output = command.output().expect("Failed to execute command");

            // Check the command's exit status
            if output.status.success() {
                println!("Certificate removed successfully.");
            } else {
                eprintln!("Error: {:?}", output);
            }
        } else {
            eprintln!("Failed to convert home directory to string.");
        }
    } else {
        eprintln!("Home directory not found.");
    }
}


fn main() {
  let _ = fix_path_env::fix();
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      add_cert_to_keychain, 
      remove_cert_from_keychain
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}


