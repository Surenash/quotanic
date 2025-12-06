from OCC.Core.BRepPrimAPI import BRepPrimAPI_MakeBox
from OCC.Core.STEPControl import STEPControl_Writer, STEPControl_AsIs
from OCC.Core.Interface import Interface_Static

def create_box_step(filename, dx, dy, dz):
    # Create a box
    box_shape = BRepPrimAPI_MakeBox(dx, dy, dz).Shape()
    
    # Initialize STEP Writer
    step_writer = STEPControl_Writer()
    Interface_Static.SetCVal("write.step.schema", "AP214")
    
    # Transfer shape
    step_writer.Transfer(box_shape, STEPControl_AsIs)
    
    # Write to file
    status = step_writer.Write(filename)
    if status == 1:
        print(f"Successfully wrote {filename}")
    else:
        print(f"Failed to write {filename}")

if __name__ == "__main__":
    # Create a 10x10x10 mm cube
    create_box_step("designs/test_data/cube_10mm.step", 10.0, 10.0, 10.0)
