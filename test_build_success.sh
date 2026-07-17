while true; do
  task_status=$(manage_task status bf5ceeb5-b32d-4738-b93f-c0a8df2435f7/task-371 || echo "not running")
  if [[ "$task_status" == *"not running"* ]]; then
     break
  fi
  sleep 1
done
